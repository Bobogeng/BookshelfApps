const bookshelfs = [];
const RENDER_EVENT = "render-todo";
const SAVED_EVENT = "saved-todo";
const STORAGE_KEY = "BOOKSHELF_APPS";
let isEdit, bookshelfTrash;

document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
    const completeBookshelfList = document.getElementById("completeBookshelfList");
    const bookTitle = document.getElementById("title");
    const author = document.getElementById("author");
    const yearPublished = document.getElementById("year");
    const isRead = document.getElementById("isRead");

    incompleteBookshelfList.innerHTML = "";
    completeBookshelfList.innerHTML = "";
    bookTitle.value = "";
    author.value = "";
    yearPublished.value = "";
    isRead.checked = "";

    for (const bookshelfItem of bookshelfs) {
        const bookshelfElement = makeBookshelf(bookshelfItem);
        if (!bookshelfItem.isComplete) incompleteBookshelfList.append(bookshelfElement);
        else completeBookshelfList.append(bookshelfElement);
    }
});

function isStorageExist() {
    if (typeof Storage === undefined) {
        alert("Browser kamu tidak mendukung local storage");
        return false;
    }
    return true;
}

function generateId() {
    let result = "";
    for (let i = 0; i < 10; i++) {
        const random = Math.floor(Math.random() * 10);
        result += random;
    }
    return result;
}

function generateBookshelfObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete,
    };
}

function addBookshelf() {
    const bookTitle = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const yearPublished = document.getElementById("year").value;
    const isRead = document.getElementById("isRead").checked;

    const generatedID = generateId();
    const bookshelfObject = generateBookshelfObject(generatedID, bookTitle, author, yearPublished, isRead);
    bookshelfs.push(bookshelfObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function editBookshelf(bookshelfTarget) {
    const bookTitle = document.getElementById("titleEdit");
    const author = document.getElementById("authorEdit");
    const yearPublished = document.getElementById("yearEdit");
    const isRead = document.getElementById("isReadEdit");

    for (const index in bookshelfs) {
        if (bookshelfs[index].id === bookshelfTarget.id) {
            bookshelfs[index].title = bookTitle.value;
            bookshelfs[index].author = author.value;
            bookshelfs[index].year = yearPublished.value;
            bookshelfs[index].isComplete = isRead.checked;
        }
    }

    const textHeader = document.getElementById("text-title");
    textHeader.innerHTML = "Masukkan Buku Baru";

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

document.addEventListener("DOMContentLoaded", function () {
    const submitForm = document.getElementById("formBook");
    submitForm.addEventListener("submit", function (e) {
        e.preventDefault();
        addBookshelf();
    });

    const editForm = document.getElementById("formBookEdit");
    editForm.addEventListener("submit", function (e) {
        e.preventDefault();
        editBookshelf(isEdit);
        editForm.style.display = "none";
        submitForm.style.display = "block";
        isEdit = "";
    });

    const modal = document.getElementById("myModal");
    const btnYes = document.getElementsByClassName("button-yes")[0];

    btnYes.addEventListener("click", function () {
        removeBookshelfFromCompleted(bookshelfTrash.id);
        modal.style.display = "none";
    });

    const close = document.getElementsByClassName("close")[0];
    close.addEventListener("click", function () {
        modal.style.display = "none";
    });

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    const btnNo = document.getElementsByClassName("button-no")[0];
    btnNo.addEventListener("click", function () {
        modal.style.display = "none";
    });

    formSearch.addEventListener("submit", function (e) {
        e.preventDefault();
        searchTitle();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function findBookshelf(bookshelfId) {
    for (const bookshelfItem of bookshelfs) {
        if (bookshelfItem.id === bookshelfId) {
            return bookshelfItem;
        }
    }
    return null;
}

function findBookshelfIndex(bookshelfId) {
    for (const index in bookshelfs) {
        if (bookshelfs[index].id === bookshelfId) {
            return index;
        }
    }

    return -1;
}

function addBookshelfToCompleted(bookshelfId) {
    const bookshelfTarget = findBookshelf(bookshelfId);

    if (bookshelfTarget == null) return;

    bookshelfTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBookshelfFromCompleted(bookshelfId) {
    const bookshelfTarget = findBookshelfIndex(bookshelfId);

    if (bookshelfTarget === -1) return;

    bookshelfs.splice(bookshelfTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function searchTitle() {
    const formSearch = document.getElementById("searchBook");
    const filter = formSearch.value.toUpperCase();
    const article = document.getElementsByTagName("article");

    for (let i = 0; i < article.length; i++) {
        const title = article[i].getElementsByClassName("title")[0];
        const textValue = title.textContent || title.innerText;
        if (textValue.toUpperCase().indexOf(filter) > -1) {
            article[i].style.display = "";
        } else {
            article[i].style.display = "none";
        }
    }
}

function makeBookshelf(bookshelfObject) {
    const textTitle = document.createElement("h2");
    textTitle.classList.add("title");
    textTitle.innerText = bookshelfObject.title;

    const iconAuthor = document.createElement("div");
    const textAuthor = document.createElement("p");
    textAuthor.innerText = bookshelfObject.author;

    const containerAuthor = document.createElement("div");
    containerAuthor.classList.add("author");

    containerAuthor.append(iconAuthor, textAuthor);

    const iconYear = document.createElement("div");
    const textYear = document.createElement("p");
    textYear.innerText = bookshelfObject.year;

    const containerYear = document.createElement("div");
    containerYear.classList.add("year");

    containerYear.append(iconYear, textYear);

    const containerInner = document.createElement("div");
    containerInner.classList.add("inner");

    containerInner.append(textTitle, containerAuthor, containerYear);

    const container = document.createElement("article");
    container.append(containerInner);
    container.setAttribute("id", `bookshelf-${bookshelfObject.id}`);

    const containerInnerButton = document.createElement("div");
    containerInnerButton.classList.add("inner-button");

    function editBookshelfFromIncompleted(bookshelfId) {
        const bookshelfTarget = findBookshelf(bookshelfId);

        if (bookshelfTarget === null) return;

        const textHeader = document.getElementById("text-title");
        const bookTitle = document.getElementById("titleEdit");
        const author = document.getElementById("authorEdit");
        const yearPublished = document.getElementById("yearEdit");
        const isRead = document.getElementById("isReadEdit").checked;

        textHeader.innerHTML = `Update Buku Berjudul ${bookshelfTarget.title}`;
        bookTitle.value = bookshelfTarget.title;
        author.value = bookshelfTarget.author;
        yearPublished.value = bookshelfTarget.year;
        isRead.checked = bookshelfTarget.isComplete;

        const submitForm = document.getElementById("formBook");
        submitForm.style.display = "none";
        const editForm = document.getElementById("formBookEdit");
        editForm.style.display = "block";
        isEdit = bookshelfTarget;
    }

    function undoBookshelfFromCompleted(bookshelfId) {
        const bookshelfTarget = findBookshelf(bookshelfId);

        if (bookshelfTarget == null) return;

        bookshelfTarget.isComplete = false;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    bookshelfTrash = bookshelfObject;
    if (bookshelfObject.isComplete) {
        const undoButton = document.createElement("button");
        undoButton.classList.add("undo", "undo-button");

        undoButton.addEventListener("click", function () {
            undoBookshelfFromCompleted(bookshelfObject.id);
        });

        const trashButton = document.createElement("button");
        trashButton.classList.add("red", "trash-button");

        const modal = document.getElementById("myModal");
        trashButton.addEventListener("click", function () {
            bookshelfTrash = bookshelfObject;
            modal.style.display = "block";
        });

        containerInnerButton.append(undoButton, trashButton);
        container.append(containerInnerButton);
    } else {
        const checkButton = document.createElement("button");
        checkButton.classList.add("green", "check-button");

        checkButton.addEventListener("click", function () {
            addBookshelfToCompleted(bookshelfObject.id);
        });

        const editButton = document.createElement("button");
        editButton.classList.add("yellow", "edit-button");

        editButton.addEventListener("click", function () {
            if (!isEdit) {
                editBookshelfFromIncompleted(bookshelfObject.id);
            } else {
                isEdit = "";
                const submitForm = document.getElementById("formBook");
                const editForm = document.getElementById("formBookEdit");
                editForm.style.display = "none";
                const textHeader = document.getElementById("text-title");
                textHeader.innerHTML = "Masukkan Buku Baru";
                submitForm.style.display = "block";
            }
        });

        const trashButton = document.createElement("button");
        trashButton.classList.add("red", "trash-button");

        const modal = document.getElementById("myModal");
        trashButton.addEventListener("click", function () {
            bookshelfTrash = bookshelfObject;
            modal.style.display = "block";
        });

        containerInnerButton.append(checkButton, editButton, trashButton);
        container.append(containerInnerButton);
    }

    return container;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(bookshelfs);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const bookshelf of data) {
            bookshelfs.push(bookshelf);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}
