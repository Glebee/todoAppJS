const newTodo = document.querySelector('#new-todo');
const selectUser = document.querySelector('#user-todo');
const listTodo = document.querySelector('#todo-list');
const addButton = document.querySelector('#addButton');
let posts = [];
let users = [];

addNewTodo = async() => {
    addButton.disabled = true;
    let enteredText = document.querySelector('#new-todo').value;
    let selectedUser = selectUser.options[selectUser.selectedIndex].id;
    if (selectedUser != "") {
        selectedUser = +selectedUser;
        selectedUser = selectedUser + 1;
        const newPost = {
            userId : selectedUser,
            id: posts.length + 1,
            title : enteredText,
            completed : false
        }
        await JSON.stringify(newPost);
        await addTodo(newPost);
        addButton.disabled = false;
    } else {
        alert("choose user");
        addButton.disabled = false;
    }
}
addButton.addEventListener('click', addNewTodo);


addUsers = (someUsers) => {
    for (let i = 0; i < someUsers.length; i++) {
        const addOption = document.createElement("option");
        addOption.id = i;
        addOption.className = "user";
        addOption.text = someUsers[i].name;
        selectUser.add(addOption, null);
    }
}
addPosts = () => {    
    //console.log(posts);
    findName = (posts, users, count) => {
        let found = {...users.filter(elem => elem.id === posts[count].userId)};
        return found[0].name;
     }
    for (let i = posts.length - 1; i >= 0; i--) {
        const addPost = document.createElement("li");
        addPost.className = "todo-item";
        addPost.innerHTML = posts[i].title + `<strong> by ${findName(posts, users, i)}</strong>`;
        listTodo.appendChild(addPost);
        addPost.id = posts[i].id;
    }
}


addCheckSwitchers = () => {
    let todoItems = document.querySelectorAll(".todo-item");
    todoItems.forEach(el => {
        const addChecked = document.createElement("input");
        addChecked.type = "checkbox";
        addChecked.className = "check";
        el.appendChild(addChecked);
        const tmp = +addChecked.parentElement.id;
        addChecked.value = posts.find(el => el.id == tmp).completed;
        addChecked.checked = posts.find(el => el.id == tmp).completed;
        addChecked.id = addChecked.parentElement.id;
    })
    addToCheckListeners();
    console.log("checkboxes added!");
}
addToCheckListeners = () => {
    const check = document.querySelectorAll(".check");
    check.forEach(el => {
        el.addEventListener("change", toCheck);
    })
}
toCheck = (e) => {
    let todoID = e.target.parentElement.id;
    if (e.target.checked){
        changeStatus(todoID, true);
        posts.find(el => el.id == todoID).completed = true;
    }
    else if (!e.target.checked){
        changeStatus(todoID, false);
        posts.find(el => el.id == todoID).completed = false;
    }
}


addButtonsRemove = () => {
    let todoItems = document.querySelectorAll(".todo-item");
    todoItems.forEach(el => {
        const addButton = document.createElement("button");
        addButton.innerHTML = "X";
        addButton.className = "close"
        el.appendChild(addButton);
        addButton.id = addButton.parentElement.id;
    })
    addToCloseListeners();
    console.log("removebuttons added!");
}
addToCloseListeners = () => {
    const btns = document.querySelectorAll(".close");

    btns.forEach(btn => {
        btn.addEventListener('click', toClose);
    })
}
toClose = (e) => {
    let todoID = e.target.parentElement.id;
    deleteTodo(todoID);
}



renderTodo = async() => {
    while(listTodo.firstChild) {
        listTodo.firstChild.querySelector(".close").removeEventListener("click", toClose);
        listTodo.firstChild.querySelector(".check").removeEventListener("change", toCheck);
        listTodo.removeChild(listTodo.firstChild);
    }
    await addPosts();
    await addButtonsRemove();
    await addCheckSwitchers();
    console.log("page rendered!");
}
toCreatePost = (post) => {
    posts.push(post);
    renderTodo();
}
toDeletePost = (id) => {
    posts = posts.filter(e => e.id != id);
    console.log(`post ${id} deleted`)
    renderTodo()
}


changeStatus = async(todoID, status) => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoID}`,
        {
           method: 'PATCH',
           body: JSON.stringify({
                completed: status,
           }),
           headers: {
            'Content-Type': 'application/json'
           }
        }
    
    )
    .then(response => response.json())
    .then(json => console.log(`status of post ${todoID} changed`, json))
    .catch(alert);
}
addTodo = async(post) => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/todos/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(post)
    })
    .then(response => {
        if (response.ok){
            console.log("added new post", post);
            toCreatePost(post);
        }
    })
    .catch(alert);

}
deleteTodo = async(todoID) => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoID}`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        }
     )
     .then(response => {
        if (response.ok) {
            toDeletePost(todoID);
        }
     })
     .catch(alert);
   
}
getUsers = async() => {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const data = await response.json();
    return await data;
    } catch(e) {
        console.log("ERROR!", e.message);
    }
}
getPosts = async () => {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos');
        const data = await response.json();
        return await data;
    } catch(e) {
        console.log("ERROR!"+ e.message);
    }
}

go = async() => {
    await getUsers().then(
        (result) => {
            for (let i = 0; i < result.length; i++) {
                users.push(result[i]);
            }
        }
        
    );
    await addUsers(users);
    await getPosts().then(
        (result) => {
            for (let i = 0; i < result.length; i++) {
                posts.push(result[i]);
            }
        }
    );
    await addPosts(posts, users);
    await addButtonsRemove();
    await addCheckSwitchers();
}
go();