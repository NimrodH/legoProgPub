"use strict"
let currentSession = null;///will be created in messages
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
    group;///each group handle differant no. of models when training
    currentModelInArray = 0;///index in array of shown model
    traininigModel;
    fb;

    constractor(id) {
        this.userID = id;
        //await getData(tableURL, { 'myStep': 'ALL' })
    }

    async initSession() {
        //this.traininigModel =  await getData(tableURL, { 'myStep': 'ALL' })
        this.fb = new FbMessages("בוקר אביבי ושמח");
        this.traininigModel =  await loadModelData();
        switch (this.group) {
            case 'A'://two modeles
                console.log("initSession A");
                createModel("aaa");///second model (first one is the default empty one)
                reBuildModel(this.traininigModel,3);
                //createModel("aaa");
                break;
        
            default:
                console.log("initSession default")
                break;
        }
    }

    reportConnect(newElement) {
        console.log("reportConnect");
        ///for each mode write the model/ write user time and error / create next automtic stage
    }

}