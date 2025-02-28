"use strict"
let currentSession = null;///will be created in messages
let allowReport = false;

async function saveUserAction(actionType, ActionDetails, actionId, block, model, step, time, user, group, part) {
    if (!allowReport) {
        return;
    }
    let bodyData = {
        'ActionType': actionType,
        'ActionDetails': ActionDetails,
        'actionId': actionId,
        'block': block,
        'group': group,
        'model': model,
        'step': step,
        'time': time,
        'user': user + part,
        'part': part
    }
    var result = await postData(usersURL, bodyData);
    //console.log("saveUserAction: "+ actionType);
}



class Session {
    userId;
    myPairId;
    actionId = 0;/// running number for any action (click) the user done - to be used on the database table
    connectedStage = 0;///the order number of true conection action (no matter which model) in the session
    group;///each group handle differant no. of models when training
    startAutoColor; ///we set it here in the constructor (even id number will start with auto)
    currAutoColor; ///init as startAutoColor but can be changed if deal done 
    pairName;///will be in format (830_831) the first user ID _ and one number above it (that must be the other user in the pair)
    currentModelInArray = 0;///index in array of shown model
    fb;///one line message to the larner. usage: //this.fb = new FbMessages("בוקר אביבי ושמח");
    trainingModelData;///array item per line. each line is object with the following props:
    part = "learning"///learning, training, examA, examB
    modelInConnectedStage;///array: item i represent  the i correct connection that done (in any models). the value is the title of the model to use for it
    modelInConnectedStage2///array for the second halth of the mition. parts 22-44
    worldByModel;///model Mn will be in the world that is the value of item n
    timer;
    msgNextBtn; ///the next button we will get from messages when it creat this session
    endPart1 = false;
    lastStepInPart1;
    timeOfPart1;
    //timer;//
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
        const firstChar = id.charAt(0);
        if (firstChar == "9") { 
            id = id.slice(1);
            reRunningSession = true;
            enforceTraining = false;
        }
        this.userId = id;
        var number;
        var pairStart;
        var pairEnd;
        if (!(isNaN(id))) {
            console.log('Input was not a number we will convert it');
            number = parseInt(id, 10);
        }
        
        let isODD = (number % 2 === 0);
        ///the user with even id number will start with auto color
        if (isODD) {
            pairEnd = (number + 1).toString();
            pairStart = id;
            this.startAutoColor = "YES";
            this.myPairId = pairEnd;
        } else {
            pairStart = (number - 1).toString();
            pairEnd = id;
            this.startAutoColor = "NO";
            this.myPairId = pairStart;
        }
        if((this.userId == "666") || (this.userId == "667")) {
            enforceTraining = false;
        }
        this.currAutoColor = this.startAutoColor;
        this.pairName = pairStart + "_" + pairEnd;
        addEventListener("reportClick", this.handleReportClick.bind(this));
    }

    handleReportClick = (e) => {
        //console.log('Event received:');
        //console.log(e);
        if (this.part !== "learning" && currentModel) {
            let modelMx = currentModel.metadata.modelTitle;
            if (e.detail.action != "connect") { ///connect handle seperatly in 
                saveUserAction(e.detail.action, e.detail.details, this.actionId++, e.detail.newElement.name, modelMx, currentModel.metadata.numOfBlocks + 1, Date.now(), this.userId, this.group, this.part)
            }
        }
        // Handle the event
    }

    async initSession() {
        this.timer = new Timer()
        allowReport = true;
        console.log("allowReport set to true");


        //elementsMenu.metadata.labelObj =  new FbMessages("תפריט אבני בניין",0,1,0);    
        this.trainingModelData = await loadModelData();
        //this.requestedModelName;///we will set it when we ask user to change model 
        ///we use it when comparing its selection in reportConnect
        ///the value of item i is the model name to use in overall stage i in this session
        ///the next stage number of spsific model is kept on the model
        if (this.userId == 666 || this.userId == 667) {
            this.modelInConnectedStage = ["M1", "M1", "M4", "M4", "M4", "M2"];
        } else {
            this.modelInConnectedStage = ["M1", "M1", "M4", "M4", "M4", "M2", "M2", "M2", "M2", "M3", "M3", "M3", "M2", "M2", "M2", "M2", "M4", "M4", "M4", "M4", "M1", "M1", "M1", "M3", "M3", "M3", "M1", "M1", "M1", "M4", "M4", "M4", "M4", "M2", "M2", "M2", "M3", "M3", "M3", "M1", "M1", "M1", "M3", "M3"];
            //this.modelInConnectedStage2 = ["M1", "M3", "M3", "M3", "M1", "M1", "M1", "M4", "M4", "M4", "M4", "M2", "M2", "M2", "M3", "M3", "M3", "M1", "M1", "M1", "M3", "M3"];
        }
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
            case "A": ///all models in the same world
                this.worldByModel = { "M1": "W1", "M2": "W1", "M3": "W1", "M4": "W1" };
                break;
            case "B": ///two worlds
                setVisibleModel(m3, false);
                setVisibleModel(m4, false);
                this.worldByModel = { "M1": "W1", "M2": "W1", "M3": "W2", "M4": "W2" };

                break;
            case "C":///each model in one of 4 worlds
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
                ////N1/5
                messageBox.hide();
                elementsMenu.metadata.labelObj.hide();
                ///for M1 that is in 5, 0, -5
                //camera.position = new BABYLON.Vector3( 5, 1.5, 0);
                //camera.setTarget(new BABYLON.Vector3( 5, 0, -5));
                //////for M4 and M3 that is in -5, 0, -5
                //camera.position = new BABYLON.Vector3( -7, 1.5, 0);
                //camera.setTarget(new BABYLON.Vector3( -5, 0, -5));
                //////for _____ that is in 5, 0, 5
                camera.position = new BABYLON.Vector3(12, 1.0, 1);
                camera.setTarget(new BABYLON.Vector3(5, 0, 5));

                elementsMenu.position.x = 100;
                //if (this.userId == "w1") {
                //    console.log("W1!!!");
                setWorld(this.userId);
                //}

                ////N1/5
                break;
            case "E":
                elementsMenu.metadata.labelObj.hide();
                elementsMenu.position.x = 5;
                currentModel = createModel("man", "M1", 0, 0, 0);
                currentModel.metadata.labelObj.hide();
                ground.material.lineColor = colorName2Vector("selected");//yellow
                break;

            default:
                break;
        }
        if (this.group == "A" || this.group == "B" || this.group == "C") {
            ///the normal groups. (differ than rebuild (D) or takepics)
            /*
            let modelLabel = this.modelInConnectedStage[this.connectedStage];
            currentModel = getModel(modelLabel);///connectedStage = 0
            currentWorld = this.worldByModel[modelLabel];
            setWorld(currentWorld);///TODO:in setWorld show only relevent models follwing session.worldByModel
            let msg = "Please do step 1 in Model " + currentModel.metadata.modelTitle + ", following the above picture";
            let mName = currentModel.metadata.modelName;
            let pic = "textures/" + mName + "1.JPG";
            console.log("pic: " + pic)
            this.doFbMessage(msg, pic);
            */
            this.runPart();
            this.initUser();
            colorButtonsIsVisible((this.currAutoColor == "NO"))///if it is "YES we get false = hide
        }
        
    }

    async  initUser() {
        ///add record for user including its connectionId
        const initialData = {
            action: 'initUser',
            userId: this.userId,
            group: this.group,
            startAutoColor: this.startAutoColor,
            pairName: this.pairName,
            myPairId: this.myPairId
        };
        if (socket && (socket.readyState === WebSocket.OPEN)) {
            socket.send(JSON.stringify(initialData));
        } else {
            if (messageBox) {
                messageBox.reconnectButton.isVisible = true;
            }
        }
    }



    async updateBuySellTime(secondsOffered) {
        ///add buy\sell time to record for existing user 
        console.log("in updateBuySellTime")
        const initialData = {
            action: 'offerSeconds',
            userId: this.userId,
            secondsOffered: secondsOffered,
            startAutoColor: this.startAutoColor,
            part1Time: this.timeOfpart1
        };
        if (socket && (socket.readyState === WebSocket.OPEN)) {
            socket.send(JSON.stringify(initialData));
                    ///we update again in case the previous was not accepted
        } else {
            if (messageBox) {
                messageBox.reconnectButton.isVisible = true;
            }
        }
    }

    async updatePartTime(partTime, whichPart) {
        ///add buy\sell time to record for existing user 
        console.log("in updatePartTime whichPart: " + whichPart)
        let initialData;
        if(whichPart == "1") {
            console.log("in whichPart == 1")
            initialData = {
                action: 'updateTime',
                userId: this.userId,
                part1Time: partTime,
                startAutoColor: this.startAutoColor
            }
        } else {
            console.log("in whichPart == 2")
            initialData = {
                action: 'updateTime',
                userId: this.userId,
                part2Time: partTime,
                startAutoColor: this.startAutoColor
            };
        }
        if (socket && (socket.readyState === WebSocket.OPEN)) {
            socket.send(JSON.stringify(initialData));
        } else {
            if (messageBox) {
                messageBox.reconnectButton.isVisible = true;
            }
        }
    }

    runPart() {
        let delButton = (near.children).filter(b => b.name == "delete")[0];
        delButton.isVisible = false;///if we allow to delete correct block we will get connectedStage++ twice
        let modelLabel = this.modelInConnectedStage[this.connectedStage];
        currentModel = getModel(modelLabel);///connectedStage = 0
        currentWorld = this.worldByModel[modelLabel];
        setWorld(currentWorld);///TODO:in setWorld show only relevent models follwing session.worldByModel
        let msg = "Please do step 1 in Model " + currentModel.metadata.modelTitle + ", following the above picture";
        let mName = currentModel.metadata.modelName;
        let pic = "textures/" + mName + "1.JPG";
        //console.log("pic: " + pic);
        this.doFbMessage(msg, pic);

        ///autocolor
        if (this.currAutoColor == "YES") {
            ///TODO: we need to get the block type and color of the next model & step
            ///         we have step+1, mName, it as "destModel.metadata.modelName"???                    
            const nexstDataLine = this.trainingModelData.filter(el => (el.step == 1) && (el.modelName == mName))[0];
            ///TODO: then to set the rlevant block in the menu to this color
            ///          we have nestDataLine.type, nestDataLine.color
            let menuBlock = elementsMenu.getChildMeshes(false, node => node.name == nexstDataLine.type)[0];
            let newColor = colorName2Vector(nexstDataLine.color);
            menuBlock.material.diffuseColor = newColor;
        }
    }

    nextStage() {
        console.log("nextStage");
        ///TODO: delete old models (they alreadtbuilt now)
        //disposeModels();
        ///TODO: must add "this.part" to the users records on the data base
        let timeToShow;
        switch (this.part) {
            case "training":
                this.timer.stopTimer();
                timeToShow = Math.floor((this.timer.currTime - this.timer.firstTime) / 1000);
                //console.log("timer stopped from nextStage" + timeToShow)
                this.timeOfpart1 = this.timer.secToTimeString(timeToShow);///was wrong currTime
                this.updatePartTime(this.timeOfpart1, "1");
                this.doFbMessage("סיימת את השלב הראשון. התבונן/י במסך הירוק מאחוריך להוראות");
                ///messageBox.showExamA();///when he will click there "next" we will call initExamA
                messageBox.showPart2_1();///for couple stoped after 22 stones and we will continue whit next 22 instead of exam
                elementsMenu.isVisible = false;
                allButtonsIsVisible(false);
                break;
            case "examA":
                this.timer.stopTimer();
                this.doFbMessage("סיימת את שלב הרצה 1 מתוך 2. התבונן/י במסך הירוק מאחוריך להוראות");
                messageBox.showExamB();///when he will click there "next" we will call initExamB
                break;
            case "examB":
                this.timer.stopTimer();
                timeToShow = Math.floor((this.timer.currTime - this.timer.firstTime) / 1000);
                let timeOfpart2 = this.timer.secToTimeString(timeToShow);
                this.updatePartTime(timeOfpart2, "2")

                this.doFbMessage("סיימת את הניסוי. התבונן/י במסך הירוק מאחוריך לפרידה");
                messageBox.showLastScreen();
                allButtonsIsVisible(false);
                
                break;

            default:
                break;
        }
    }

    updateDB(theTime) {

    }

    initPart2() {
        console.log("in initPart2")
        if (!this.timer) {
            this.timer = new Timer();
        }
        
        this.timer.startTimer();
        console.log("timer start from initPart2")
        elementsMenu.isVisible = true;
        this.reportConnect()
        this.part = "examB";///the last part = part2 in our case now
        //this.askToDoNextBlock(3);
    }

    initExamA() {
        ///we will use the same this.trainingModelData because we use same models as in training
        this.part = "examA";
        let m1 = createModel("car", "M1", 5, 0, -5);
        if (this.userId == 666 || this.userId == 667) {
            this.modelInConnectedStage = ["M1", "M1"];
        } else {
            this.modelInConnectedStage = ["M1", "M1", "M1", "M1", "M1", "M1", "M1", "M1", "M1", "M1", "M1"];
        }
        this.worldByModel = { "M1": "W1", "M2": "W1", "M3": "W1", "M4": "W1" };///we need here only M1
        this.connectedStage = 0;
        this.timer.startTimer();
        this.runPart();
    }

    initExamB() {
        ///we will use the same this.trainingModelData because we use same models as in training
        this.part = "examB";
        let m2 = createModel("chair", "M2", -5, 0, -5);
        let m3 = createModel("dog", "M3", 5, 0, -5);
        if (this.userId == 666 || this.userId == 667) {
            this.modelInConnectedStage = ["M3", "M3"];
        } else {
            this.modelInConnectedStage = ["M3", "M3", "M3", "M2", "M2", "M2", "M2", "M3", "M3", "M3", "M2", "M2", "M2", "M2", "M3", "M3", "M3", "M3", "M3", "M2", "M2", "M2"];
        }
        this.worldByModel = { "M1": "W1", "M2": "W1", "M3": "W1", "M4": "W1" };///we need here only M2 & M3
        this.connectedStage = 0;
        this.timer.startTimer();
        this.runPart();
    }

    ///to be removed when all wil became by events
    /*
        reportClick(action, details, newElement) {
            if (currentModel) {
                let modelMx = currentModel.metadata.modelTitle;
                saveUserAction(action, details, this.actionId++, newElement.name, modelMx, currentModel.metadata.numOfBlocks + 1, Date.now(), this.userId, this.group, this.part)
            }
        }
    */
    reportConnect(newElement) {
        if (!allowReport) {
            return;
        }
        console.log("this.endPart1: "+ this.endPart1);
        if(this.endPart1) {
            ///we here with step 22 for the second time so its time to continue with stage 2
            ///we already set this.currAutoColor in showStartPart2()
            this.endPart1 = false;
            ////
            allButtonsIsVisible(true);
            colorButtonsIsVisible(this.currAutoColor == "NO")///
            ///
            this.askToDoNextBlock(this.lastStepInPart1);             
            return
        }
        //console.log("reportConnect");
        ///for each mode write the model/ write user time and error / create next automtic stage
        let isCorect = true;
        let wrongItems = [];
        let step = newElement.metadata.blockNum;
        let destModelLabel = this.modelInConnectedStage[this.connectedStage];
        let destModel = getModel(destModelLabel);
        if (this.connectedStage == 1) {
            this.timer.startTimer();
        }
        //console.log("step: " + step);
        ////const dataLine = this.trainingModelData.filter(el => (el.step == step) && (el.modelName == currentModel.metadata.modelName))[0];
        const dataLine = this.trainingModelData.filter(el => (el.step == step) && (el.modelName == destModel.metadata.modelName))[0];
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
        /*
        ///we assume block 0 will never be :newElement
        // let modelName = newElement.parent.metadata.modelName;
        if (currentModel.metadata.modelName !== dataLine.modelName) {
            isCorect = false;
            wrongItems.push("model");
        }
        */
        ///we assume block 0 will never be :newElement
        let modelName = newElement.parent.metadata.modelName;
        //console.log("modelName: " + modelName);
        //console.log("dataLine.modelName: " + dataLine.modelName);
        if (modelName !== dataLine.modelName) {
            isCorect = false;
            wrongItems.push("model");
        }
        if (isCorect) {
           
            //this.fb.dispose()
            //this.fb = new FbMessages((step + 1) + " יפה מאד. המשך לשלב")
            this.connectedStage++;
            console.log("connectedStage in is corect: "+ this.connectedStage);
            if (this.connectedStage == this.modelInConnectedStage.length/2) {
                if ( !this.endPart1) {///can be canceled we have return when endPart1 is false
                    ///we here with step 22 for the first time
                    this.endPart1 = true;
                    console.log("this.endPart1 set to true")
                    //this.connectedStage--;//this will set .endPart1 to true again next time
                    ///not needed becaus we did connectedStage work?
                    this.lastStepInPart1 = step;
                    //this.timer.stopTimer(); ///done in: nextStage -->  case "training"
                    console.log("timer stopped from reportConnect")
                } 
            }

            if (this.group == "A" || this.group == "B" || this.group == "C") {
                //let mName;
                let modelMx = currentModel.metadata.modelTitle;
                saveUserAction("connect", "CORRECT", this.actionId++, typeName, modelMx, step, Date.now(), this.userId, this.group, this.part);
                //console.log("this.connectedStage: " + this.connectedStage);
                //console.log(this.modelInConnectedStage.length + 1);
                this.askToDoNextBlock(step); ///moved to function
 
            } else {///E
                let msg = this.doFbMessage((step + 1));
            }
        } else {///wrong move
            //this.fb.dispose()
            //this.fb = new FbMessages((step + 1) + " מהלך שגוי. הורד את האבן [<<] ונסה שוב")
            let msg = (step + 1) + " מהלך שגוי. הורד את האבן [<<] ונסה שוב";
            let mName = currentModel.metadata.modelName;
            this.doFbMessage(msg, "textures/" + mName + step + ".JPG");
            let modelMx = currentModel.metadata.modelTitle;
            saveUserAction("connect", "WRONG: " + wrongItems.toString(), this.actionId++, typeName, modelMx, step, Date.now(), this.userId, this.group, this.part);
            let addButton = (near.children).filter(b => b.name == "connect")[0];
            let delButton = (near.children).filter(b => b.name == "delete")[0];
            addButton.isVisible = false;
            delButton.isVisible = true;
        }
    }

    askToDoNextBlock(step) {
        let mName;
        if (this.connectedStage == this.modelInConnectedStage.length || this.endPart1) {
            ///we have to start the exam stage
            //this.endPart1 = false;will be done in reportConnect after ussing it
            this.nextStage();
            return;
        }
        if (this.modelInConnectedStage[this.connectedStage] == currentModel.metadata.modelTitle) {
            //this.doFbMessage(currentModel.metadata.modelTitle + ":במודל זה " + (step + 1) + " יפה מאד. המשך לשלב");
            let msg = "Very good. Please do next step " + (step + 1) + " in this Model (" + currentModel.metadata.modelTitle + ")";
            mName = currentModel.metadata.modelName;
            this.doFbMessage(msg, "textures/" + mName + (step + 1) + ".JPG");
        } else {
            let nextModelLabel = this.modelInConnectedStage[this.connectedStage];
            currentModel = getModel(nextModelLabel);///connectedStage = 0
            let nextWorld = this.worldByModel[nextModelLabel];
            if (nextWorld !== currentWorld) {
                setWorld(nextWorld);///will update currentWorld in the function
            }
            step = currentModel.metadata.numOfBlocks;
            //this.doFbMessage(nextModelLabel + ":במודל  " + (step + 1) + " יפה מאד. בצע שלב");

            let msg = "Very good. Please do step " + (step + 1) + " in Model " + nextModelLabel + " (located in other place)"
            mName = currentModel.metadata.modelName;
            this.doFbMessage(msg, "textures/" + mName + (step + 1) + ".JPG");
        }
        ///TODO: if we in autoColor
        if (this.currAutoColor == "YES") {
            console.log("step: " +step + " mName: " + mName)
            ///TODO: we need to get the block type and color of the next model & step
            ///         we have step+1, mName, it as "destModel.metadata.modelName"???                    
            const nexstDataLine = this.trainingModelData.filter(el => (el.step == step +1) && (el.modelName == mName))[0];
            ///TODO: then to set the rlevant block in the menu to this color
            ///          we have nestDataLine.type, nestDataLine.color
            console.log("step: " + step + "mName: " + mName)
            let menuBlock = elementsMenu.getChildMeshes(false, node => node.name == nexstDataLine.type)[0];
            let newColor = colorName2Vector(nexstDataLine.color);
            menuBlock.material.diffuseColor = newColor;
        }
    }

    reportDelete() {
        if (!allowReport) {
            return;
        }
        //console.log("reportDelete");
        ///it was worng so we still didnt incremnt connectedStage
        //console.log("this.connectedStage: " + this.connectedStage);
        let msg;
        let mName;
        let step;
        if (this.modelInConnectedStage[this.connectedStage] == currentModel.metadata.modelTitle) {
            step = currentModel.metadata.numOfBlocks;
            msg = "Please do again step " + (step + 1) + " in this Model (" + currentModel.metadata.modelTitle + ")";
            mName = currentModel.metadata.modelName;
        } else {
            let nextModelLabel = this.modelInConnectedStage[this.connectedStage];
            let nextModel = getModel(nextModelLabel);
            step = nextModel.metadata.numOfBlocks;
            mName = nextModel.metadata.modelName;
            msg = "Please do again step " + (step + 1) + " in Model (" + nextModel.metadata.modelTitle + ")";
        }
        this.doFbMessage(msg, "textures/" + mName + (step + 1) + ".JPG");
        let addButton = (near.children).filter(b => b.name == "connect")[0];
        let delButton = (near.children).filter(b => b.name == "delete")[0];
        addButton.isVisible = true;
        delButton.isVisible = false;/// if he will remove good block we will have connectedStage++ twice
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

    endSession() {
        ///created in index at socket.onopen
        clearInterval(pingInterval);
        disconnectSocket();

    }
    
}
//this.fb = new FbMessages("בוקר אביבי ושמח");
//let modelData = modelDataAll.filter(x => x.modelName == currentModel.metadata.modelName);
