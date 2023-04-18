"use strict"
/////////////////// GAME GLOBAL VERIABLES //////////////////////////
const baseColor = new BABYLON.Color3(0.54, 0.13, 0.54)
const notSelectedColor = new BABYLON.Color3(1, 0, 1);//pink
const selectedColor = new BABYLON.Color3(1, 1, 0);//yellow
const blueColor = new BABYLON.Color3(0, 0, 1);
const redColor = new BABYLON.Color3(1, 0, 0);
const blackColor = new BABYLON.Color3(0, 0, 0);
const greenColor = new BABYLON.Color3(0, 1, 0);
const rotationO = new BABYLON.Vector3(0, 0, 0);//only for model
const rotationX = new BABYLON.Vector3(1.5708, 0, 0);
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
var scene = window.scene;
function rotationVector2Name(vector) {
    if (vector.y > 0) { return "Y" };
    if (vector.z > 0) { return "Z" };
    if (vector.x > 0) { return "X" };
    return "O";
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
            return rotationO
            break;
    }
}
function colorName2Vector(theColorName) {
    return colorsObj.filter(c => c.colorName == theColorName)[0].colorVector;
}

function colorVector2Name(theColorVector) {
    console.log("color: " + theColorVector)
    return colorsObj.filter(c => c.colorVector == theColorVector)[0].colorName;
}

///we can't use split(".") because we have: b2.p-0.5
function fullName2Private(theFullName) {
    let firstDot = theFullName.indexOf(".") + 1;
    return theFullName.substr(firstDot);
}

const tableURL = 'https://9ewp86ps3e.execute-api.us-east-1.amazonaws.com/development/model';
let selectedConnection;///the sphere that was clicked on one of the elements outside the model
let modelsArray = [];
let currentModel;///returned by createModel that push it into modelsArray
let elementsMenu;///the parent of the blocks that user can select
let buttensPanel;
/////////////////// GAME FUNCTIONS //////////////////////////
function animate(box, oldPos, newPos, scene) {
    const frameRate = 40;

    const xSlide = new BABYLON.Animation("xSlide", "position", frameRate,BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    const keyFrames = [];  

    keyFrames.push({
        frame: 0,
        value: oldPos
    });
/*
    keyFrames.push({
        frame: frameRate,
        value: -2
    });
*/
    keyFrames.push({
        frame: 2 * frameRate,
        value: newPos
    });

    xSlide.setKeys(keyFrames);
    scene.beginDirectAnimation(box, [xSlide], 0, 2 * frameRate, false, 1, add2model);
    //box.animations.push(xSlide);

    //scene.beginAnimation(box, 0, 2 * frameRate, true);
    function add2model() {
        box.setParent(currentModel);
        //console.log("add2model" + oldPos.x);
        ///rais all model abo=ve ground
        currentModel.refreshBoundingInfo();
        currentModel.computeWorldMatrix(true);
        var boundingInfo = currentModel.getHierarchyBoundingVectors();
        var lowerEdgePosition = boundingInfo.min.y;
        console.log("bottom1: " + lowerEdgePosition);
        if (lowerEdgePosition < 0) {
            currentModel.position.y = currentModel.position.y - lowerEdgePosition
        }
      }
}

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
    model.position.x = -15;
    model.position.z = -5;
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
    let vectorColor = colorName2Vector(theColor);
    if (selectedConnection) {
        selectedConnection.parent.material.diffuseColor = vectorColor;
    }
}
function colorBlue() {
    setSelectedConnectionColor("blue");
}
function colorRed() {
    setSelectedConnectionColor("red");
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
    doConnect(newElement, newColor, selectedConnectionName, true);
}


function changeSky(skyPath) {
    var skybox = scene.getMeshByName("skyBox");

    var skyboxMaterial = skybox.material;
    skyboxMaterial.backFaceCulling = false;
    // Dispose of skybox material and texture
    //skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/blue", scene);
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyPath, scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    //skyboxMaterial.reflectionTexture.dispose();
    //skyboxMaterial.dispose();
    
    // Dispose of skybox mesh
    //skybox.dispose();

}

async function saveModel() {

    changeSky("textures/red");

     return;///temporary to avoid some one from removing my model
    let childs = currentModel.getChildMeshes(true);
    for (let index = 0; index < childs.length; index++) {
        const element = childs[index];
        console.log("index: " + index);
        if (element.metadata) {
            let theColor = element.material.diffuseColor;
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
    }
}

async function reBuildModel() {
    var modelDataObj = await getData(tableURL, { 'myStep': 'ALL' });///working
    let modelData = modelDataObj.Items;///working

    for (let index = 1; index < modelData.length + 1; index++) {
        const element = modelData.filter(el => el.step == index)[0];
        let srcBlockName = element.type;
        let srcConnectionName = fullName2Private(element.srcPoint);
        ///  create new element (will be sent to doConnect)
        let menuBlock = elementsMenu.getChildMeshes(false, node => node.name == srcBlockName)[0];
        let newElement = menuBlock.clone(menuBlock.name);
        ///set oriantation of the new element
        let newRotation = rotationName2Vector(element.rotation);
        newElement.rotation = newRotation;
        /// create color following the data (will be sent to doConnect)
        let newColor = colorName2Vector(element.color);
        ///set the selected connection on model (global variable)
        const inDatasDestBlock = element.destBlock;
        const inDatasDestPoint = element.destPoint;
        let s = destSphereByOldData(inDatasDestBlock, inDatasDestPoint);
        setModelSelectedConnection(currentModel, s);

        doConnect(newElement, newColor, srcConnectionName, false);
    }
}

function destSphereByOldData(blockNumber, destPoint) {
    ///find block object by number and then find and RETURN  sphere object by the block name
    if (blockNumber == "0") {
        return currentModel.getChildMeshes(false)[0];
    }
    let modelBlocks = currentModel.getChildMeshes(false);
    let destBlock = modelBlocks.filter(byBlockNum)[0];
    let sphers = destBlock.getChildMeshes(false);
    let selectedSphere = sphers.filter(bySphereName)[0];

    function byBlockNum(e) {
        console.log(e);
        if (e.metadata) {
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

///called from connect and from reBuildModel
function doConnect(newElement, newColor, selectedConnectionMame, toAnimate) {
    let newElementConnection;
    ///set any of its childrens with its own matirial and action
    let children = newElement.getChildren();
    for (let index = 0; index < children.length; index++) {
        const element = children[index];
        initMeshContactSphere(element);
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
    const matrix_m = getModelSelectedConnection(currentModel).parent.computeWorldMatrix(true);
    var global_pos_m = BABYLON.Vector3.TransformCoordinates(getModelSelectedConnection(currentModel).position, matrix_m);
    var global_delta = global_pos_m.subtract(global_pos_sc);

    ///move the elment by the calaculated vector, then add it to model
    if (toAnimate) {
        newElement.setParent(null);
        let oldPos = newElement.position;//BABYLON.Vector3.TransformCoordinates(newElement.position, matrix_m);
        
        let newPos = oldPos.add(global_delta);
        console.log(oldPos)
        console.log(newPos)
        animate(newElement, oldPos, newPos, scene); ///will setParent from inside when animation done   
    } else {
        newElement.position.addInPlace(global_delta);
        newElement.setParent(currentModel);
    }
    //////
 
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
    let currRotationName = rotationVector2Name(currentModel.rotation);
    switch (currRotationName) {
        case "X":
            currentModel.rotation = rotationName2Vector("Y");
            break;
        case "Y":
            currentModel.rotation = rotationName2Vector("Z");
            break;
        case "Z":
            currentModel.rotation = rotationName2Vector("O");
            break;
        case "O":
            currentModel.rotation = rotationName2Vector("X");
            break;
        default:
            console.log("error in flipModel");
            break;
    }
}

function flipZ() {
    if (selectedConnection) {
        selectedConnection.parent.rotation = rotationX;
        selectedConnection.parent.position.y = menuY - elementsMenuY;
    }

}
function flipX() {
    if (selectedConnection) {
        selectedConnection.parent.rotation = rotationY;
        selectedConnection.parent.position.y = menuY - elementsMenuY;
    }

}
function flipY() {
    if (selectedConnection) {
    
        //selectedConnection.parent.position.y = 5;//selectedConnection.parent.sizeX;
        selectedConnection.parent.rotation = rotationZ;
        selectedConnection.parent.refreshBoundingInfo();
        selectedConnection.parent.computeWorldMatrix(true);
        var boundingInfo = selectedConnection.parent.getBoundingInfo();
        var lowerEdgePosition = boundingInfo.boundingBox.minimumWorld.y;
        console.log("bottom1: " + lowerEdgePosition);
        if (lowerEdgePosition < 0) {
            selectedConnection.parent.position.y = selectedConnection.parent.position.y - lowerEdgePosition
        }
    }

}
///defign and highlite the conection sphere
function doClickConnection(event) {

    if (event.source.parent.metadata && event.source.parent.metadata.inModel) {
        doModelConnection(event.source);
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
    wheel.rotation = rotationX;
    addMeshContactSphere(wheel, 0);
    wheel.position.y = 1;
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
    //box.position.x = menuX;
    
    box.position.y = menuY;
    return box
}
////////////////////// end of game functions ///////////////////////////