"use strict"
let currentSession = null;
async function saveUserAction() {
    let bodyData = {
        'ActionType': "colorl",
        'ActionDetails': "blue",
        'actionId': "102",
        'block': "b5",
        'isTrueAction': "true",
        'model': "A",
        'step': "5",
        'time': "22:00",
        'user': "101"
    }
    var result = await postData(usersURL, bodyData);
}

class Session {
    userID;
    group;
    constractor(id) {
        this.userID = id;
    }
}