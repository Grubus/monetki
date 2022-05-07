let openRow;
class Coin{
    constructor(flag, name, category, alloy, year){
        this.flag = flag;
        this.name = name;
        this.category = category;
        this.alloy = alloy;
        this.year = year;
        console.log(this.createGoObject())
    }
    createGoObject(){
        return {
            Id: 0,
            Flag: this.flag,
            Name: this.name,
            Category: this.category,
            Alloy: this.alloy,
            Year: this.year
        }
    }
}

function getCoins(){
    const options = {
        method: 'GET',
    };
    fetch("/coin", options)
    .then(response => response.json())
    .then(data => {
        generateCoinsTable(data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function generateCoinsTable(coins){
        let table = document.getElementsByClassName("table_content")[0];
    table.innerHTML = "";
    if(!coins) return;      
    coins.forEach( coin => {
        table.appendChild(createRow(coin));
    });
}

function createRow(coin){
    let tr = document.createElement("tr");

    Object.keys(coin).forEach( e => {
        if(e != "Id") {
            let td = document.createElement("td");
            td.innerHTML = coin[e];
            let i = document.getElementsByClassName("table_content")[0].children.length;
            if(e == "Flag") td.addEventListener("click", e => {
                if(e.target.className != "modified") modifyRow(i, e);
            })
            tr.appendChild(td);
        }
    });
    let td = document.createElement("td");
    let button = document.createElement("button");
    button.innerText = "X";
    let i = coin.Id;
    button.addEventListener("click", function(e) {
        if(this.className == "check") modifyCoin(i, e);
        else removeCoin(i);
    });
    tr.appendChild(td.appendChild(button));
    return tr;
}

function createCoin(){
    let data = document.getElementsByClassName("table_footer")[0].children[0].children;
    const options = {
        method: 'POST',
        headers: {
            "type" : "application/json"
        },
    body: JSON.stringify({
        "Flag": data[0].children[0].value,
        "Name": data[1].children[0].value,
        "Category": data[2].children[0].value,
        "Alloy": data[3].children[0].value,
        "Year": parseInt(data[4].children[0].value)})
    };
    fetch("/coin", options)
    .then(response => response.json())
    .then(data => {
        let table = document.getElementsByClassName("table_content")[0];

        table.appendChild(createRow(data));
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

async function modifyRow(index, e){
    let table = document.getElementsByClassName("table_content")[0].children[index].children;
    let data = []
    for(let i = 0; i < 6; i++){
        data.push(table[i].innerHTML)
    }

    table[0].innerHTML = `<input class='modified' name='Flag' value='${data[0]}'>`;
    table[1].innerHTML = `<input name='Name' value='${data[1]}'>`;
    table[2].innerHTML = `<input name='Category' value='${data[2]}'>`;
    table[3].innerHTML = `<input name='Alloy' value='${data[3]}'>`;
    table[4].innerHTML = `<input name='Year' value='${data[4]}'>`;
    table[5].className = "check";
    if(openRow){
        console.log("lmao")
        openRow.children[5].click();
    }
    openRow = e.path[1]

}

function modifyCoin(index, row){
    let rowChildrens = row.path[1].children
    let data = [0, 0, 0, 0, 0]
    for(let i = 0; i < 5; i++){
        data[i] = rowChildrens[i].children[0]
    }

    const options = {
        method: 'PUT',
        headers: {
            "type" : "application/json"
        },
        body: JSON.stringify({
            "Id": index,
            "Flag": data[0].value,
            "Name": data[1].value,
            "Category": data[2].value,
            "Alloy": data[3].value,
            "Year": parseInt(data[4].value)})
    };
    fetch("/coin", options)
    .then(response => response.json())
    .then(data => {
        Object.keys(data).forEach( (e, i) => {
            if( e != "Id") {
                rowChildrens[i - 1].innerHTML = data[e];
            }
        })
        if(openRow == row.path[1])  openRow = null
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function removeCoin(index){
    console.log(index)
    const options = {
        method: 'DELETE',
        headers: {
            "type" : "application/json"
        },
        body: JSON.stringify(index)
    };
    fetch("/coin", options)
    .then(response => response.json())
    .then(data => {
        generateCoinsTable(data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

getCoins();
