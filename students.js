"use strict"
let currentSession = null;///will be created in messages

async function saveUserAction(actionType, ActionDetails, actionId, block, model, step, time, user, group) {
    let bodyData = {
        'ActionType': actionType,
        'ActionDetails': ActionDetails,
        'actionId': actionId,
        'block': block,
        'group': group,
        'model': model,
        'step': step,
        'time': time,
        'user': user
    }
    var result = await postData(usersURL, bodyData);
    //console.log("saveUserAction: "+ actionType);
}

class Session {
    userId;
    actionId = 0;
    group;///each group handle differant no. of models when training
    currentModelInArray = 0;///index in array of shown model
    trainingModelData;///array item per line. each line is object with the following props:
    /*
    srcPoint
    destPoint
    destBlock
    color
    rotation
    type
    step
    */
    fb;///one line message to the lerner

    constructor(id) {
        this.userId = id;
        //console.log("this.userId: " + id);
        //await getData(tableURL, { 'myStep': 'ALL' })
    }

    async initSession() {
        //this.traininigModel =  await getData(tableURL, { 'myStep': 'ALL' })
        this.fb = new FbMessages("בוקר אביבי ושמח");
        this.trainingModelData = await loadModelData();
        switch (this.group) {
            case 'A'://4 models in same world
                console.log("initSession A");
                //createModel("aaa");///second model (first one is the default empty one)
                //reBuildModel(this.trainingModelData, 3);
                //createModel("aaa");
                break;
            case 'B'://2 models in one world & 2 in another
                console.log("initSession B");
                //createModel("aaa");///second model (first one is the default empty one)
                //reBuildModel(this.trainingModelData, 3);
                //createModel("aaa");
                break;
            case 'C'://4 models each in seperate world
                console.log("initSession C");
                //createModel("aaa");///second model (first one is the default empty one)
                //reBuildModel(this.trainingModelData, 3);
                //createModel("aaa");
                break;

            default:
                console.log("initSession default")
                break;
        }
    }

    reportClick(action, details, newElement) {
        //console.log("reportClick: " + action);
        saveUserAction(action, details, this.actionId++, newElement.name, this.currentModelInArray, currentModel.metadata.numOfBlocks + 1, Date.now(), this.userId, this.group)
    }

    reportConnect(newElement) {
        //console.log("reportConnect");
        ///for each mode write the model/ write user time and error / create next automtic stage
        let isCorect = true;
        let wrongItems = [];
        let step = newElement.metadata.blockNum;
        //console.log("step: " + step);
        const dataLine = this.trainingModelData.filter(el => el.step == step)[0];
        //console.log("dataLine: " + dataLine);

        let colorName = colorVector2Name(newElement.material.diffuseColor);
        //console.log("colorName: " + colorName + "  " + dataLine.color);
        if (colorName !== dataLine.color) {
            isCorect = false;
            wrongItems.push("color");
        }

        let rotationName = rotationVector2Name(newElement.rotation);
        //console.log("rotationName: " + rotationName + "  " + dataLine.rotation);
        if (rotationName !== dataLine.rotation) {
            isCorect = false;
            wrongItems.push("rotation");
        }

        let srcPointName = newElement.metadata.connection;
        //console.log("srcPointName: " + srcPointName + "  " + dataLine.srcPoint);
        if (srcPointName !== dataLine.srcPoint) {
            isCorect = false;
            wrongItems.push("Block-Point");
        }

        let destPointName = newElement.metadata.connectedTo;
        //console.log("destPointName: " + destPointName + "  " + dataLine.destPoint);
        if (destPointName !== dataLine.destPoint) {
            isCorect = false;
            wrongItems.push("model-point");
        }

        let typeName = newElement.name;
        //console.log("typeName: " + typeName + "  " + dataLine.type);
        if (typeName !== dataLine.type) {
            isCorect = false;
            wrongItems.push("block-type");
        }

        let destBlockName = newElement.metadata.destBlock;
        //console.log("destBlockName: " + destBlockName + "  " + dataLine.destBlock);
        if (destBlockName.toString() !== dataLine.destBlock.toString()) {
            isCorect = false;
            wrongItems.push("model-block");
        }

        if (isCorect) {
            this.fb.dispose()
            this.fb = new FbMessages((step + 1) + " יפה מאד. המשך לשלב")
            saveUserAction("connect", "CORRECT", this.actionId++, typeName, this.currentModelInArray, step, Date.now(), this.userId, this.group)
        } else {
            this.fb.dispose()
            this.fb = new FbMessages((step + 1) + " מהלך שגוי. הורד את האבן [<<] ונסה שוב")
            saveUserAction("connect", "WRONG: " + wrongItems.toString(), this.actionId++, typeName, this.currentModelInArray, step, Date.now(), this.userId, this.group)

        }
    }
    ///move not done (i.e. missing selected point).
    /// we have another function "session.reportConnect" when connection done
    reportForbiddenMove(wrongConnection, wrongModelConnection) {
        console.log("reportWrongMove: ");
    }

}