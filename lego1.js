"use strict"
/////////////////// GAME GLOBAL VERIABLES //////////////////////////
const baseColor = new BABYLON.Color3(0.54, 0.13, 0.54)
const notSelectedColor = new BABYLON.Color3(1, 0, 1);//pink
const selectedColor = new BABYLON.Color3(1, 1, 0);//yellow
const blueColor = new BABYLON.Color3(0, 0, 1);
const redColor = new BABYLON.Color3(1, 0, 0);
const blackColor = new BABYLON.Color3(0, 0, 0);
const greenColor = new BABYLON.Color3(0, 1, 0);
const rotationX = new BABYLON.Vector3(0, 0, 0);
const rotationY = new BABYLON.Vector3(0, 1.5708, 0);
const rotationZ = new BABYLON.Vector3(0, 0, 1.5708);//Math.PI / 2 get diferent value in its last digit here and when called from mesh
const colorsObj = [
    { "colorName": "blue", "colorVector": blueColor },
    { "colorName": "base", "colorVector": baseColor },
    { "colorName": "red", "colorVector": redColor },
    { "colorName": "green", "colorVector": greenColor },
    { "colorName": "black", "colorVector": blackColor },
    { "colorName": "selected", "colorVector": selectedColor },
    { "colorName": "notSelected", "colorVector": notSelectedColor }
];
//{"rotationMame": "X", x: Math.PI / 2, y:0, z:0},
/*
const rotationsObj = [
    { "rotationMame": "X", "rotationVector": rotationX },
    { "rotationMame": "Y", "rotationVector": rotationY },
    { "rotationMame": "Z", "rotationVector": rotationZ }
];
*/
function rotationVector2Name(vector) {
    if (vector.y > 0) { return "Y" };
    if (vector.z > 0) { return "Z" };
    return "X";
}

function rotationName2Vector(theName) {
    switch (theName) {
        case "X":
            return rotationX
            break;
        case "Y":
            return rotationY
            break;
        case "Z":
            return rotationZ
            break;
        default:
            break;
    }
}
function colorName2Vector(theColorName) {
    return colorsObj.filter(c=>c.colorName == theColorName)[0].colorVector;
}

function colorVector2Name(theColorVector) {
    console.log ("color: "+theColorVector)
    return colorsObj.filter(c=>c.colorVector == theColorVector)[0].colorName;
}

///we can't use split(".") because we have: b2.p-0.5
function fullName2Private(theFullName) {
    let firstDot = theFullName.indexOf(".") + 1;
    return theFullName.substr(firstDot);
}

const tableURL = 'https://9ewp86ps3e.execute-api.us-east-1.amazonaws.com/development/model';
let selectedConnection;///the sphere that was clicked on one of the elements outside the model
//let modelSelectedConnection;///the sphere that was clicked on one of the elements in the model
let modelsArray = [];
let currentModel;
let elementsMenu;///the parent of the blocks that user can select
let buttensPanel;
/////////////////// GAME FUNCTIONS //////////////////////////
function setVisibleMeshChilds(theMesh, setItVisible) {
    theMesh.isVisible = setItVisible;
    let childs = theMesh.getChildMeshes(false);
    for (let index = 0; index < childs.length; index++) {
        const element = childs[index];
        element.isVisible = setItVisible;
    }
}

function createModel() {
    let model = meshBlock(scene, 1);
    model.position.x = -20;
    model.metadata = {
        inModel: true,
        blockNum: 0,
        numOfBlocks: 0
    };
    modelsArray.push(model);
    return model;
}

function getModelSelectedConnection(model) {
    return model.metadata.selectedConnection;
}
function setModelSelectedConnection(model, selectedConnectionSphere) {
    model.metadata.selectedConnection = selectedConnectionSphere;
}

function setSelectedConnectionColor(theColor) {
    //sendMessage({ "R": r });
    //let vectorColor = colorsObj.filter(c => c.colorName == theColor)[0].colorVector
    let vectorColor = colorName2Vector(theColor);
    if (selectedConnection) {
        selectedConnection.parent.material.diffuseColor = vectorColor;
    }
}
function colorBlue() {
    setSelectedConnectionColor("blue");
    //setSelectedConnectionColor(colorsObj.filter(c=>c.colorName = "blue")[0].colorVector);
}
function colorRed() {
    setSelectedConnectionColor("red");
    //setSelectedConnectionColor(redColor);
}
function colorBlack() {
    setSelectedConnectionColor("black");
}
function colorGreen() {
    setSelectedConnectionColor("green");
}

function connect() {
    if (!(selectedConnection && getModelSelectedConnection(currentModel))) {
        console.log("please select points");
        reportWrongMove(selectedConnection, getModelSelectedConnection(currentModel))
        return;
    }
    ///create element to place in the model
    let newElement = selectedConnection.parent.clone(selectedConnection.parent.name);
    let newColor = selectedConnection.parent.material.diffuseColor;
    let selectedConnectionName = selectedConnection.name;
    doConnect(newElement, newColor, selectedConnectionName);
}

async function saveModel() {
    let childs = currentModel.getChildMeshes(true);
    for (let index = 0; index < childs.length; index++) {
        const element = childs[index];
        console.log("index: " + index);
        if (element.metadata) {

            /*
            console.log("blockNum (step): " + element.metadata.blockNum);
            console.log("connection (srcPoint): " + element.metadata.connection);
            console.log("connectedTo(destPoint): " + element.metadata.connectedTo);
            console.log("destBlock: " + element.metadata.destBlock);//element.metadata.connectedTo.parent.metadata.blockNum);
            console.log("type: " + element.name);//element.metadata.connection.parent.name);
            console.log("rotation: " + element.rotation);//element.metadata.connection.parent.rotation);
            console.log("color: " + element.material.diffuseColor);//element.metadata.connection.parent.material.diffuseColor);
            */
            //let vectorColor = colorsObj.filter(c=>c.colorName == theColor)[0].colorVector
            let theColor = element.material.diffuseColor;
            //let theColorName = colorsObj.filter(c => c.colorVector == theColor)[0].colorName;

            ///we dont use for now "table" parameter. the lambda function dont work when we set table name as parameter
            let bodyData = {
                'table': "recordedModel",
                'step': element.metadata.blockNum,
                'color': colorVector2Name(theColor),
                'destBlock': element.metadata.destBlock,
                'destPoint': element.metadata.connectedTo,
                'rotation': rotationVector2Name(element.rotation),
                'srcPoint': element.metadata.connection,
                'type': element.name
            }
            var result = await postData(tableURL, bodyData);
        }
        //console.log(index + " : " + JSON.stringify(element.metadata));

    }
}

async function reBuildModel() {
    var modelDataObj = await getData(tableURL, { 'myStep': 'ALL' });///working
    //console.log(modelDataObj.Items);
    let modelData = modelDataObj.Items;///working
    //let menuBlock = elementsMenu.getChildMeshes(false, node => node.name == "b5")[0];
    //console.log(menuBlock.rotation == rotationsObj[0]);
    //menuBlock.diffuseColor = //{R: 1 G:0 B:0};
    
    for (let index = 1; index < modelData.length+1; index++) {    
    //for (let index = 1; index < 26; index++) {
        console.log("index: " + index);
        const element = modelData.filter(el => el.step == index)[0];

        //console.log("element: " + JSON.stringify(element));
        //const inDataBlockName = element.type;
        //const inDataConnectionName = element.srcPoint;
        //let converted = convertBlockAndsphereNames(inDataBlockName, inDataConnectionName);///helper function
        //let srcBlockName = converted.newBlockName;
        //let srcConnection = converted.newSphereName;
        let srcBlockName = element.type;
        let srcConnectionName = fullName2Private(element.srcPoint);
        //let srcConnectionName = element.srcPoint.split(".")[1]
        /// use converted block name to create new element (will be sent to doConnect)
        let menuBlock = elementsMenu.getChildMeshes(false, node => node.name == srcBlockName)[0];
        let newElement = menuBlock.clone(menuBlock.name);
        //TODO: set oriantation of the new element
        //let inDataRotatoion = element.rotation;
        let newRotation = rotationName2Vector(element.rotation);
        newElement.rotation = newRotation;
        /// create color following the data (will be sent to doConnect)
        //const inDataColor = element.color;
        let newColor = colorName2Vector(element.color);
        
        ///set the selected connection on model (global variable)
        const inDatasDestBlock = element.destBlock;
        const inDatasDestPoint = element.destPoint;
        let s = destSphereByOldData(inDatasDestBlock, inDatasDestPoint);
        //console.log("s.name: " + s.name)
        setModelSelectedConnection(currentModel, s);

        doConnect(newElement, newColor, srcConnectionName)
        
    }
/*
    function convertBlockAndsphereNames(inDataBlockName, inDataConnectionName) {
        let blockName;
        let connectionName;
        switch (inDataBlockName) {
            case "b1x5":
                blockName = "b5";
                switch (inDataConnectionName) {
                    case "A":
                        connectionName = "p-2";
                        break;
                    case "B":
                        connectionName = "p-1";
                        break;
                    case "C":
                        connectionName = "p2";
                        break;
                    case "D":
                        connectionName = "p1";
                        break;
                    case "E":
                        connectionName = "p0";
                        break;
                    default:
                        connectionName = inDataConnectionName;
                        break;
                }

                break;
            case "b1x3":
                blockName = "b3";
                switch (inDataConnectionName) {
                    case "A":
                        connectionName = "p-1";
                        break;
                    case "B":
                        connectionName = "0";
                        break;
                    case "C":
                        connectionName = "p1";
                        break;
                    default:
                        connectionName = inDataConnectionName;
                        break;
                }
                break;
            case "b1x2":
                blockName = "b2";
                if (inDataConnectionName == "A") {
                    connectionName = "p-0.5";
                } else {
                    connectionName = "p0.5";
                }
                break;
            case "c2x2":
                blockName = "c1";
                connectionName = "p0";
                break;
            default:
                blockName = inDataBlockName;
                connectionName = inDataConnectionName;
                break;
        }
        return { newBlockName: blockName, newSphereName: connectionName }
    }
    */
}

function destSphereByOldData(blockNumber, destPoint) {
    ///find block object by number and then find שמג RETURN  sphere object by the block name
    if (blockNumber == "0") {
        //let sphereName = "p0";
        return currentModel.getChildMeshes(false)[0];
    }
    let modelBlocks = currentModel.getChildMeshes(false);

    //console.log(modelBlocks);
    let destBlock = modelBlocks.filter(byBlockNum)[0];
    //let destBlockName = destBlock.name;
    //console.log(destBlockName);
    //let sphereName = getDestPointFullNameOnModel(destBlockName, destPoint);
    //let sphereName = destPoint
    //console.log("sphereName: " + sphereName);
    let sphers = destBlock.getChildMeshes(false);
    let selectedSphere = sphers.filter(bySphereName)[0];

/*
    function getDestPointFullNameOnModel(blockType, inDataConnectionName) {
        switch (blockType) {
            case "b5":
                switch (inDataConnectionName) {
                    case "A":
                        return "b5.p-2";
                        break;
                    case "B":
                        return "b5.p-1";
                        break;
                    case "C":
                        return "b5.p2";
                        break;
                    case "D":
                        return "b5.p1";
                        break;
                    case "E":
                        return "b5.p0";
                        break;
                    default:
                        return inDataConnectionName;
                        break;
                }

                break;
            case "b3":
                switch (inDataConnectionName) {
                    case "A":
                        return "b3.p-1";
                        break;
                    case "B":
                        return "b3.0";
                        break;
                    case "C":
                        return "b3.p1";
                        break;
                    default:
                        return inDataConnectionName;
                        break;
                }
                break;
            case "b2":
                if (inDataConnectionName == "A") {
                    return "b2.p-0.5";
                } else {
                    return "b2.p0.5";
                }
                break;
            case "c1":
                return "c1.p0";
                break;
            default:
                return inDataConnectionName;
                break;
        }

    }
*/
    function byBlockNum(e) {
        console.log(e);
        if (e.metadata) {
            //console.log ("blockNumber: " + blockNumber + "  e.metadata.blockNum: "+ e.metadata.blockNum);
            return e.metadata.blockNum == blockNumber;
        } else {
            return false;
        }

    }

    function bySphereName(e) {
        if (e.name) {
            return e.name == destPoint;
        } else {
            return false;
        }

    }
    return selectedSphere;
}

function doConnect(newElement, newColor, selectedConnectionMame) {
    let newElementConnection;
    ///set any of its childrens with its own matirial and action
    let children = newElement.getChildren();
    for (let index = 0; index < children.length; index++) {
        const element = children[index];
        initMeshContactSphere(element);
        //let elementPrivateName = element.name.split(".")[1];
        //let firstDot = element.name.indexOf(".") + 1;
        //let elementPrivateName = element.name.substr(firstDot);
        //console.log("elementPrivateName: " + elementPrivateName);
        ///element.name is like b33.p-1 while selectedConnectionMame is like p-1 without prefix
        if (fullName2Private(element.name) == selectedConnectionMame) {
            newElementConnection = element;
        }
    }


    newElement.material = new BABYLON.StandardMaterial("myMaterial", scene);
    newElement.material.diffuseColor = newColor;


    ///calculate the vector between the selected spheres in the new element and in the model
    const matrix_sc = newElementConnection.parent.computeWorldMatrix(true);
    var global_pos_sc = BABYLON.Vector3.TransformCoordinates(newElementConnection.position, matrix_sc);
    //console.log("global_pos_sc : " + global_pos_sc);
    const matrix_m = getModelSelectedConnection(currentModel).parent.computeWorldMatrix(true);
    var global_pos_m = BABYLON.Vector3.TransformCoordinates(getModelSelectedConnection(currentModel).position, matrix_m);
    //console.log("global_pos_m : " + global_pos_m);
    var global_delta = global_pos_m.subtract(global_pos_sc);
    //console.log("global_delta : " + global_delta);

    ///move the elment by the calaculated vector, then add it to model
    newElement.position.addInPlace(global_delta);
    newElement.setParent(currentModel);
    newElement.metadata = {
        inModel: true,
        blockNum: currentModel.metadata.numOfBlocks + 1,
        connection: newElementConnection.name, //selectedConnection,
        connectedTo: getModelSelectedConnection(currentModel).name,
        destBlock: getModelSelectedConnection(currentModel).parent.metadata.blockNum
    };
    currentModel.metadata.numOfBlocks = currentModel.metadata.numOfBlocks + 1;
    getModelSelectedConnection(currentModel).scaling = new BABYLON.Vector3(0.9, 0.9, 0.9);
    ///TODO:rescale if removing block
    setModelSelectedConnection(currentModel, null);
    reportConnect(newElement);///newElement has connectedTo object
}
///turn the elemets
function flipModel() {
    currentModel.rotation = rotationZ
    /*
    currentModel.rotation.x = 0;
    currentModel.rotation.y = 0;
    currentModel.rotation.z = Math.PI / 2;
    */
}

function flipZ() {
    if (selectedConnection) {
        selectedConnection.parent.rotation = rotationX;
        /*
        selectedConnection.parent.rotation.x = 0
        selectedConnection.parent.rotation.y = 0
        selectedConnection.parent.rotation.z = Math.PI / 2;
        */
    }

}
function flipX() {
    if (selectedConnection) {
        selectedConnection.parent.rotation = rotationY;
        /*
        selectedConnection.parent.rotation.z = rotationsObj[0].z;//0
        selectedConnection.parent.rotation.y = rotationsObj[0].y;//0
        selectedConnection.parent.rotation.x = rotationsObj[0].x;//Math.PI / 2;
        //selectedConnection.parent.rotation.x = 0;///not work for sphere
        */
    }

}
function flipY() {
    if (selectedConnection) {
        selectedConnection.parent.rotation = rotationZ;
        /*
        selectedConnection.parent.rotation.z = 0
        selectedConnection.parent.rotation.x = 0
        selectedConnection.parent.rotation.y = Math.PI / 2;
        */
    }

}
///defign and highlite the conection sphere
function doClickConnection(event) {

    if (event.source.parent.metadata && event.source.parent.metadata.inModel) {
        doModelConnection(event.source);
        //console.log(event.source.parent.metadata.blockNum);
        return;
    } else {
        doElementConnection(event.source);
    }
}

function doElementConnection(connectionSphere) {
    if (selectedConnection && connectionSphere !== selectedConnection) {
        selectedConnection.material.diffuseColor = notSelectedColor;
    }
    selectedConnection = connectionSphere;

    let m = selectedConnection.material;
    if (m.diffuseColor == selectedColor) {
        m.diffuseColor = notSelectedColor;
        selectedConnection = null;
    } else {
        m.diffuseColor = selectedColor;
    }
}



///defign and highlite the conection sphere in the model (called from doClickConnection)
function doModelConnection(connectionSphere) {

    if (getModelSelectedConnection(currentModel) && connectionSphere !== getModelSelectedConnection(currentModel)) {
        getModelSelectedConnection(currentModel).material.diffuseColor = notSelectedColor;
    }
    setModelSelectedConnection(currentModel, connectionSphere);

    let m = getModelSelectedConnection(currentModel).material;
    if (m.diffuseColor == selectedColor) {
        m.diffuseColor = notSelectedColor;
        setModelSelectedConnection(currentModel, null);
    } else {
        m.diffuseColor = selectedColor;
    }
}

///add sphere to Block/wheel 
function addMeshContactSphere(meshParent, meshPosition) {
    let tempSphere = BABYLON.MeshBuilder.CreateSphere("p" + meshPosition, { diameter: 1.2 })
    tempSphere.parent = meshParent;
    tempSphere.position.x = meshPosition;
    initMeshContactSphere(tempSphere);
}

///set matirial and action to connection sphere (called from addMeshContactSphere and connect) 
function initMeshContactSphere(tempSphere) {
    const myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
    myMaterial.diffuseColor = notSelectedColor;
    tempSphere.material = myMaterial;

    tempSphere.actionManager = new BABYLON.ActionManager(scene);
    tempSphere.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, doClickConnection))
}

///create round elment (Wheel)
function meshWheel(scene, wheelWidth) {
    const wheel = BABYLON.MeshBuilder.CreateCylinder("c" + wheelWidth, { height: 1, diameter: 2 });
    const myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
    myMaterial.diffuseColor = baseColor;//new BABYLON.Color3(0.54, 0.13, 0.54);
    wheel.material = myMaterial;
    wheel.rotation.x = Math.PI / 2;
    addMeshContactSphere(wheel, 0);
    return wheel;
}

///create rectangle element (block)
function meshBlock(scene, blockWidth) {
    const box = BABYLON.MeshBuilder.CreateBox("b" + blockWidth, { width: blockWidth, height: 1 });
    const myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
    myMaterial.diffuseColor = baseColor;//new BABYLON.Color3(0.54, 0.13, 0.54);
    box.material = myMaterial;
    //box.position.x = 2;
    const blockWidthFloor = Math.floor(blockWidth / 2);
    if (blockWidthFloor == blockWidth / 2) { //זוגי
        for (let index = 0; index < blockWidthFloor; index++) {
            addMeshContactSphere(box, index - 0.5)
            addMeshContactSphere(box, index + 0.5)
        }
    } else { //פירדי
        for (let index = 0; index < blockWidthFloor + 1; index++) {
            addMeshContactSphere(box, index)
            if (index !== 0) {
                addMeshContactSphere(box, -index)
            }
        }
    }
    return box
}
////////////////////// end of game functions ///////////////////////////