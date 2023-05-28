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
    actionId = 0;/// running number for any action (click) the user done - to be used on the database table
    connectedStage = 0;///the order number of true conection action (no matter which model) in the session
    group;///each group handle differant no. of models when training
    currentModelInArray = 0;///index in array of shown model
    fb;///one line message to the larner. usage: //this.fb = new FbMessages("בוקר אביבי ושמח");
    trainingModelData;///array item per line. each line is object with the following props:

    modelInConnectedStage;///array: item i represent  the i correct connection that done (in any models). the value is the title of the model to use for it
    worldByModel;///model Mn will be in the world that is the value of item n
    /*
    srcPoint
    destPoint
    destBlock
    color
    rotation
    type
    step
    */

    constructor(id) {
        this.userId = id;
    }

    async initSession() {
        //elementsMenu.metadata.labelObj =  new FbMessages("תפריט אבני בניין",0,1,0);    
        this.trainingModelData = await loadModelData();
        //this.requestedModelName;///we will set it when we ask user to change model 
        ///we use it when comparing its selection in reportConnect
        ///the value of item i is the model name to use in overall stage i in this session
        ///the next stage number of spsific model is kept on the model
        this.modelInConnectedStage = ["M1", "M1", "M4", "M4", "M4", "M2", "M2", "M2", "M2", "M3", "M3", "M2", "M2", "M2", "M4", "M4", "M4", "M4", "M1", "M1", "M1", "M1", "M3", "M3", "M3", "M2", "M2", "M2", "M4", "M4", "M4", "M4", "M1", "M1", "M1", "M1", "M1", "M3", "M3", "M3", "M2", "M2", "M2", "M2", "M3", "M3", "M3"];
        //this.worldByModel; ///model Mn will be in the world that is the value of item n
        let m1;
        let m2;
        let m3;
        let m4;
        if (this.group == "A" || this.group == "B" || this.group == "C") {
            ///the normal groups. (differ than rebuild (D) or takepics)
            /// we may need to set it in the "switch" if we want differant positions in each group
            m1 = createModel("car", "M1", 5, 0, -5);
            m2 = createModel("chair", "M2", -5, 0, -5);
            m3 = createModel("dog", "M3", -5, 0, 5);
            m4 = createModel("man", "M4", 5, 0, 5);
        }

        switch (this.group) {///TODO: build more then one model as defined for the group
            case "A":
                this.worldByModel = { "M1": "W1", "M2": "W1", "M3": "W1", "M4": "W1" };
                break;
            case "B":
                setVisibleModel(m3, false);
                setVisibleModel(m4, false);
                this.worldByModel = { "M1": "W1", "M2": "W1", "M3": "W2", "M4": "W2" };

                break;
            case "C":
                this.worldByModel = { "M1": "W1", "M2": "W2", "M3": "W3", "M4": "W4" };
                setVisibleModel(m3, false);
                setVisibleModel(m4, false);
                setVisibleModel(m2, false);
                break;
            case "D":
                currentModel = createModel("chair", "M2", 5, 0, 5);
                let modelData = this.trainingModelData.filter(x => x.modelName == currentModel.metadata.modelName);
                reBuildModel(modelData, modelData.length + 1);
                currentModel = createModel("man", "M4", -5, 0, -5);
                modelData = this.trainingModelData.filter(x => x.modelName == currentModel.metadata.modelName);
                reBuildModel(modelData, modelData.length + 1);
                currentModel = createModel("car", "M1", 5, 0, -5);
                modelData = this.trainingModelData.filter(x => x.modelName == currentModel.metadata.modelName);
                reBuildModel(modelData, modelData.length + 1);
                currentModel = createModel("dog", "M3", -5, 0, 5);
                modelData = this.trainingModelData.filter(x => x.modelName == currentModel.metadata.modelName);
                reBuildModel(modelData, modelData.length + 1);
                break;
            case "E":
                elementsMenu.metadata.labelObj.hide();
                elementsMenu.position.x = 5;
                currentModel = createModel("car", "M1", 0, 0, 0);
                currentModel.metadata.labelObj.hide();
                ground.material.lineColor = colorName2Vector("black");
                break;

            default:
                break;
        }
        if (this.group == "A" || this.group == "B" || this.group == "C") {
            ///the normal groups. (differ than rebuild (D) or takepics)
            let modelLabel = this.modelInConnectedStage[this.connectedStage];
            currentModel = getModel(modelLabel);///connectedStage = 0
            currentWorld = this.worldByModel[modelLabel];
            setWorld(currentWorld);///TODO:in setWorld show only relevent models follwing session.worldByModel
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
        ////const dataLine = this.trainingModelData.filter(el => (el.step == step) && (el.modelName == currentModel.metadata.modelName))[0];
        const dataLine = this.trainingModelData.filter(el => (el.step == step) && (el.modelName == currentModel.metadata.modelName))[0];
        //console.log("dataLine: ");
        //console.log(dataLine);
        if (!dataLine) {
            this.doFbMessage("no more steps");
            console.log("missing line. no more steps?");
            return
        }
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
            wrongItems.push("destenation-point");
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
            wrongItems.push("destenation-block");
        }
        ///we assume block 0 will never be :newElement
        // let modelName = newElement.parent.metadata.modelName;
        if (currentModel.metadata.modelName !== dataLine.modelName) {
            isCorect = false;
            wrongItems.push("model");
        }

        if (isCorect) {
            //this.fb.dispose()
            //this.fb = new FbMessages((step + 1) + " יפה מאד. המשך לשלב")
            this.connectedStage++;
            if (this.group == "A" || this.group == "B" || this.group == "C") {
                saveUserAction("connect", "CORRECT", this.actionId++, typeName, this.currentModelInArray, step, Date.now(), this.userId, this.group);

                if (this.modelInConnectedStage[this.connectedStage] == currentModel.metadata.modelTitle) {
                    //this.doFbMessage(currentModel.metadata.modelTitle + ":במודל זה " + (step + 1) + " יפה מאד. המשך לשלב");
                    let msg = "Very good. Please do next step " + (step + 1) + " in this Model (" + currentModel.metadata.modelTitle + ")"
                    this.doFbMessage(msg, "textures/" + "car" + (step + 1) + ".JPG");
                } else {
                    let nextModelLabel = this.modelInConnectedStage[this.connectedStage];
                    currentModel = getModel(nextModelLabel);///connectedStage = 0
                    let nextWorld = this.worldByModel[nextModelLabel];
                    if (nextWorld !== currentWorld) {
                        setWorld(nextWorld);///will update currentWorld in the function
                    }
                    //this.doFbMessage(nextModelLabel + ":במודל  " + (step + 1) + " יפה מאד. בצע שלב");
                    let msg = "Very good. Please do step " + (step + 1) + " in Model " + nextModelLabel + " (located in other place)"
                    this.doFbMessage(msg, "textures/" + "car" + (step + 1) + ".JPG");
                }
            } else {///E
                let msg =  this.doFbMessage((step + 1));
            }
        } else {
            //this.fb.dispose()
            //this.fb = new FbMessages((step + 1) + " מהלך שגוי. הורד את האבן [<<] ונסה שוב")
            let msg = (step + 1) + " מהלך שגוי. הורד את האבן [<<] ונסה שוב";
            this.doFbMessage(msg, "textures/" + "car" + step + ".JPG");;
            saveUserAction("connect", "WRONG: " + wrongItems.toString(), this.actionId++, typeName, this.currentModelInArray, step, Date.now(), this.userId, this.group)

        }
    }
    ///move not done (i.e. missing selected point).
    /// we have another function "session.reportConnect" when connection done
    reportForbiddenMove(wrongConnection, wrongModelConnection) {
        console.log("reportWrongMove: ");
    }

    doFbMessage(message, pic) {
        if (this.fb) {
            this.fb.dispose();
        }
        this.fb = new FbMessages(message, 0, 2.5, 2, pic)
    }
}
 //this.fb = new FbMessages("בוקר אביבי ושמח");
 //let modelData = modelDataAll.filter(x => x.modelName == currentModel.metadata.modelName);