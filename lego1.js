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
            return rotationO
            break;
    }
}
function colorName2Vector(theColorName) {
    return colorsObj.filter(c => c.colorName == theColorName)[0].colorVector;
}

function colorVector2Name(theColorVector) {
    return colorsObj.filter(c => c.colorVector == theColorVector)[0].colorName;
}

///we can't use split(".") because we have: b2.p-0.5
function fullName2Private(theFullName) {
    let firstDot = theFullName.indexOf(".") + 1;
    return theFullName.substr(firstDot);
}

const tableURL = 'https://9ewp86ps3e.execute-api.us-east-1.amazonaws.com/development/model';
const usersURL = 'https://9ewp86ps3e.execute-api.us-east-1.amazonaws.com/development/users';
let selectedConnection;///the sphere that was clicked on one of the elements outside the model
let modelsArray = [];
let currentModel;///returned by createModel that push it into modelsArray
let elementsMenu;///the parent of the blocks that user can select
let currentWorld;///to be returned by setWorld (that call chgangeSky)

///modelLabel is like "M1". used in the arry of jumps
///(differ then metadat.modelName wjich is the object for the label)
/// moelName is like "car" it is in metadata.modelName. used in the database.
/// the function returns the model object


///model.metadata.modelTitle is the text on the model. model.Obj is the object for label
function getModel(modelLabel) {
    //console.log("modelsArray[]");
    //console.log(modelsArray);
    return modelsArray.filter(x => x.metadata.modelTitle == modelLabel)[0];
}
/////////////////// GAME FUNCTIONS //////////////////////////

///move block and connect it to model
function animate(box, oldPos, newPos, scene) {
    const frameRate = 40;
    const xSlide = new BABYLON.Animation("xSlide", "position", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const keyFrames = [];
    keyFrames.push({
        frame: 0,
        value: oldPos
    });
    keyFrames.push({
        frame: 2 * frameRate,
        value: newPos
    });

    xSlide.setKeys(keyFrames);
    scene.beginDirectAnimation(box, [xSlide], 0, 2 * frameRate, false, 1, add2model);

    function add2model() {
        box.setParent(currentModel);
        ///rais all model above ground
        setOnGround(currentModel, 1);
        let h = getTop(currentModel);
        currentModel.metadata.labelObj.setY(h + 0.3);
        if (currentSession) {
            currentSession.reportConnect(box);///newElement(= box) has connectedTo object
        }
    }
}

function setOnGround(element, factor) {
    ///factor is the scale of parent of element while elemnt scale in it is 1 (we need worldScale of element)
    element.refreshBoundingInfo();
    element.computeWorldMatrix(true);
    var boundingInfo = element.getHierarchyBoundingVectors();
    var lowerEdgePosition = boundingInfo.min.y;
    if (lowerEdgePosition < 0) {
        element.position.y = element.position.y - (lowerEdgePosition / factor)
    }
    //console.log("element.position.y after: " + element.position.y);
}

function getTop(model) {
    model.refreshBoundingInfo();
    model.computeWorldMatrix(true);
    var boundingInfo = model.getHierarchyBoundingVectors();
    return boundingInfo.max.y;


}
///TODO: I remember there is built-in property\function that hide mesh including its childs? instead of the following?
function setVisibleModel(theMesh, setItVisible) {
    theMesh.isVisible = setItVisible;
    let childs = theMesh.getChildMeshes(false);
    for (let index = 0; index < childs.length; index++) {
        const element = childs[index];
        element.isVisible = setItVisible;
    }
    if (setItVisible) {
        theMesh.metadata.labelObj.show();
    } else {
        theMesh.metadata.labelObj.hide();
    }
    
}

function createNearMenu(mode) {
    const manager = new BABYLON.GUI.GUI3DManager(scene);
    let near = new BABYLON.GUI.NearMenu("near");
    manager.addControl(near);
    let follower = near.defaultBehavior.followBehavior; //returns the followbehavior created by the 
    near.defaultBehavior.followBehaviorEnabled = false;
    near.columns = 5;
    near.margin = 0.2
    near.position = new BABYLON.Vector3(1, 6, 1);
    near.isVisible = false;
    near.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
    near.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);

    function createTouchButton(name, title, color, theFunction) {
        let button = new BABYLON.GUI.TouchHolographicButton(name);
        //button.text = title;
        button.onPointerUpObservable.add(theFunction);
        near.addButton(button);
        const text1 = new BABYLON.GUI.TextBlock();
        text1.text = title;
        text1.color = color;
        text1.fontSize = 90;
        text1.fontStyle = "bold";
        button.content = text1;
        return button;
    }

    createTouchButton("flipX", "/", "yellow", flipX);
    createTouchButton("flipZ", "---", "yellow", flipZ);//X
    createTouchButton("flipY", "|", "yellow", flipY);
    createTouchButton("connect", "add\n< <", "yellow", connect);
    //createTouchButton("turn\nmodel", "yellow", flipModel);
    createTouchButton("delete", "delete\n> >", "yellow", removeLastBlock);
    createTouchButton("red", "red", "red", colorRed);
    createTouchButton("black", "black", "black", colorBlack);
    createTouchButton("green", "green", "green", colorGreen);
    createTouchButton("blue", "blue", "blue", colorBlue);
    if (mode == "record") {
        createTouchButton("reBuild", "re\nBuild", "yellow", reBuildModelBut);
        createTouchButton("Save", "Save", "yellow", saveModel);
    }
    ///near.scaling - new BABYLON.Vector3(0.6,0.6,0.6);///not working?
    return near;
}

function createModel(theModelName, theModelTitle, x, y, z) {
    var pos = new BABYLON.Vector3(x, y, z);
    let model = meshBlock(scene, 1);
    //model.getChildMeshes(false)[1].dispose();
    //model.position.x = -5;
    //model.position.z = -5;
    model.position = pos;
    model.metadata = {
        inModel: true,
        blockNum: 0,
        numOfBlocks: 0,
        modelName: theModelName,
        modelTitle: theModelTitle
    };
    model.scaling = scailingMenuModel;
    model.metadata.labelObj = new FbMessages(theModelTitle, x, y + 1, z);
    modelsArray.push(model);
    setOnGround(model, 1);
    return model;
}

function disposeModels() {
    for (let index = modelsArray.length-1; index > -1; index--) {
        //let element = modelsArray[index];
        let element = modelsArray.pop();
        element.metadata.labelObj.dispose();
        element.dispose();
    }
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
        if (currentSession) {
            currentSession.reportClick("color", theColor, selectedConnection.parent);
        }
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

function removeLastBlock() {
    if (!currentModel) { /// we are on instructions before setting model
        return;
    }
    ///if user click another model before he click delete we dont want to delete feom wrong 
    if (currentSession ) {
        let modelLabel = currentSession.modelInConnectedStage[currentSession.connectedStage];
        
    }

    let lastBlockNum = currentModel.metadata.numOfBlocks;
    if (lastBlockNum == 0) return;
    let modelBlocks = currentModel.getChildMeshes(false);
    let lastBlock = modelBlocks.filter(lastByBlockNum)[0];
    let destConnectionSphereName = lastBlock.metadata.connectedTo;
    let destBlockNum = lastBlock.metadata.destBlock;
    //console.log("destBlockNum: " + destBlockNum);
    //console.log("lastBlockNum: " + lastBlockNum);
    let destBlock
    if (lastBlockNum > 1) {
        destBlock = modelBlocks.filter(destByBlockNum)[0];
    } else {
        destBlock = currentModel;
    }
    let sphers = destBlock.getChildMeshes(false);
    let selectedSphere = sphers.filter(bySphereName)[0];
    selectedSphere.scaling = new BABYLON.Vector3(1, 1, 1);

    lastBlock.dispose();
    currentModel.metadata.numOfBlocks = currentModel.metadata.numOfBlocks - 1;
    if (currentSession ) {
        currentSession.reportDelete();
    }

    function lastByBlockNum(e) {
        return (isBlockByBlockNum(e, lastBlockNum));
    }

    function destByBlockNum(e) {
        return (isBlockByBlockNum(e, destBlockNum));
    }

    function bySphereName(e) {
        return isSphereBySphereName(e, destConnectionSphereName);
    }
}

///return true if the block numbered "blockNumber"
///used by removeLastBlock & rebuild--> 
function isBlockByBlockNum(block, blockNumber) {
    if (block.metadata) {
        return block.metadata.blockNum == blockNumber;
    } else {
        return false;
    }
}
///return true if the sphere named "sphereName"
///used by removeLastBlock & rebuild--> 
function isSphereBySphereName(sphere, sphereName) {
    if (sphere.name) {
        return sphere.name == sphereName;
    } else {
        return false;
    }
}


function connect() {
    if (!currentModel) { /// we are on instructions before setting model
        return;
    }
    if (!(selectedConnection && getModelSelectedConnection(currentModel))) {
        console.log("please select points");
        if (currentSession) {
            currentSession.reportForbiddenMove(selectedConnection, getModelSelectedConnection(currentModel));
        }
        return;
    }
    ///create element to place in the model
    let newElement = selectedConnection.parent.clone(selectedConnection.parent.name);
    let newColor = selectedConnection.parent.material.diffuseColor;
    let selectedConnectionName = selectedConnection.name;
    doConnect(newElement, newColor, selectedConnectionName, true);///has to be true
    /* ///moved to add2model in animate
    if (currentSession) {
        currentSession.reportConnect(newElement);///newElement has connectedTo object
    }
    */
}

///run on all models in modelsArray. if value of worldByModel[theModel] is world show the model
///model.metadata.modelTitle is the text on the model. model.metadata.labelObj is the object for label
function visibleModelsByWorld(world) {
    //console.log ("modelsArray");
    //console.log (modelsArray);
    modelsArray.forEach(model => {
        let modelLabel = model.metadata.modelTitle;
        //console.log ("model: " + model);
        //console.log ("modelLabel: " + modelLabel);
        //console.log ("world: " + world);
        //console.log (currentSession.worldByModel[modelLabel])
        setVisibleModel(model, (currentSession.worldByModel[modelLabel] == world));
    });

}


function setWorld(worldName) {
    switch (worldName) {
        case "W1":
            changeSky("textures/pink", colorName2Vector("base"));
            currentWorld = "W1";
            break;
        case "W2":
            changeSky("textures/green", colorName2Vector("green"));
            currentWorld = "W2"
            break;
        case "W3":
            changeSky("textures/blue", colorName2Vector("blue"));
            currentWorld = "W3"
            break;
        case "W4":
            changeSky("textures/red", colorName2Vector("red"));
            currentWorld = "W4"
            break;

        default:
            changeSky("textures/blue", colorName2Vector("blue"));
            break;
    }
    visibleModelsByWorld(currentWorld);///show/hide relevent models
}

function changeSky(skyPath, groundColorName) {
    var skybox = scene.getMeshByName("skyBox");

    var skyboxMaterial = skybox.material;
    skyboxMaterial.backFaceCulling = false;

    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyPath, scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    /// Dispose of skybox material and texture
    //skyboxMaterial.reflectionTexture.dispose();
    //skyboxMaterial.dispose();
    // Dispose of skybox mesh
    //skybox.dispose();
    ground.material.lineColor = groundColorName;
}


async function saveModel() {
    //messageBox.fbMode();
    //messageBox.showMessage("בוקר מאד טוב\nלכולם בארץ");
    //changeSky("textures/blue", colorName2Vector("blue"));
    //saveUserAction();

    //return;///temporary to avoid some one from removing my model

    let childs = currentModel.getChildMeshes(true);
    let name = currentModel.metadata.modelName;
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
                'type': element.name,
                'modelName': name
            }
            var result = await postData(tableURL, bodyData);
        }
    }
}

async function loadModelData() {
    let modelDataObj = await getData(tableURL, { 'myStep': 'ALL' });///working
    let modelData = modelDataObj.Items;///working
    return modelData;
}

async function reBuild4pics() {
    let modelDataAll = await loadModelData();
    let modelData = modelDataAll.filter(x => x.modelName == currentModel.metadata.modelName);

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
    //console.log("inDatasDestBlock: " + inDatasDestBlock);
    //console.log("inDatasDestPoint: " + inDatasDestPoint);

    setModelSelectedConnection(currentModel, s);

    doConnect(newElement, newColor, srcConnectionName, false);
}






async function reBuildModelBut() {
    let modelDataAll = await loadModelData();
    //console.log("currentModel.metadata.modelName" + currentModel.metadata.modelName);
    //console.log(modelDataAll);
    let modelData = modelDataAll.filter(x => x.modelName == currentModel.metadata.modelName);
    reBuildModel(modelData, modelData.length + 1);
}


///called from session.initSession
function reBuildModel(modelData, step) {
    for (let index = 1; index < step; index++) {
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
        console.log("inDatasDestBlock: " + inDatasDestBlock);
        console.log("inDatasDestPoint: " + inDatasDestPoint);

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
        return isBlockByBlockNum(e, blockNumber);
    }

    function bySphereName(e) {
        return isSphereBySphereName(e, destPoint);
    }

    return selectedSphere;
}


///called from connect and from reBuildModel
function doConnect(newElement, newColor, selectedConnectionMame, toAnimate) {
    ////let globData = arrange4Connect(newElement, newColor, selectedConnectionMame)
    
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
    
    /////moveConnect(newElement, toAnimate, globData);
    
    ///move the elment by the calaculated vector, then add it to model
    newElement.setParent(null);
    let oldPos = newElement.position;//BABYLON.Vector3.TransformCoordinates(newElement.position, matrix_m);   
    let newPos = oldPos.add(global_delta);
    if (toAnimate) {
        animate(newElement, oldPos, newPos, scene); ///will setParent from inside when animation done   
    } else {
        newElement.position = newPos;
        newElement.setParent(currentModel);
        setOnGround(currentModel, 1);
    }
    //////

    newElement.metadata = {
        inModel: true,
        blockNum: currentModel.metadata.numOfBlocks + 1,
        connection: newElementConnection.name, //selectedConnection, name of the selected sphere in the new block
        connectedTo: getModelSelectedConnection(currentModel).name, ///name of the selected sphere in the model
        destBlock: getModelSelectedConnection(currentModel).parent.metadata.blockNum //number of the selected block in the model
    };
    currentModel.metadata.numOfBlocks = currentModel.metadata.numOfBlocks + 1;
    let sc = getModelSelectedConnection(currentModel)
    sc.scaling = new BABYLON.Vector3(0.9, 0.9, 0.9);
    sc.material.diffuseColor = notSelectedColor;
    setModelSelectedConnection(currentModel, null);
    
}
/*
function arrange4Connect(newElement, newColor, selectedConnectionMame) {
    
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
    return global_delta;
}
////TODO: we neeed to transfer newElementConnection from arrange4Connect  to moveConnect
function moveConnect(newElement, toAnimate, global_delta) {
    ///move the elment by the calaculated vector, then add it to model
    newElement.setParent(null);
    let oldPos = newElement.position;//BABYLON.Vector3.TransformCoordinates(newElement.position, matrix_m);   
    let newPos = oldPos.add(global_delta);
    if (toAnimate) {
        animate(newElement, oldPos, newPos, scene); ///will setParent from inside when animation done   
    } else {
        newElement.position = newPos;
        newElement.setParent(currentModel);
        setOnGround(currentModel, 1);
    }
    //////

    newElement.metadata = {
        inModel: true,
        blockNum: currentModel.metadata.numOfBlocks + 1,
        connection: newElementConnection.name, //selectedConnection, name of the selected sphere in the new block
        connectedTo: getModelSelectedConnection(currentModel).name, ///name of the selected sphere in the model
        destBlock: getModelSelectedConnection(currentModel).parent.metadata.blockNum //number of the selected block in the model
    };
    currentModel.metadata.numOfBlocks = currentModel.metadata.numOfBlocks + 1;
    let sc = getModelSelectedConnection(currentModel)
    sc.scaling = new BABYLON.Vector3(0.9, 0.9, 0.9);
    sc.material.diffuseColor = notSelectedColor;
    setModelSelectedConnection(currentModel, null);
}
*/
///turn the elemets not in use button that call it is not visible
function flipModel() {
    if (!currentModel) { /// we are on instructions before setting model
        return;
    }
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
    if (currentSession) {
        currentSession.reportClick("flipModel", currentModel.rotation, currentModel);
    }

}
///rotate the selected block
function flipZ() {
    if (selectedConnection) {
        selectedConnection.parent.rotation = rotationX;
        selectedConnection.parent.position.y = menuY - elementsMenuY;
        if (currentSession) {
            currentSession.reportClick("flip", "Z", selectedConnection.parent);
        }
    }

}
function flipX() {
    if (selectedConnection) {
        selectedConnection.parent.rotation = rotationY;
        selectedConnection.parent.position.y = menuY - elementsMenuY;
        if (currentSession) {
            currentSession.reportClick("flip", "X", selectedConnection.parent);
        }
    }

}
function flipY() {
    if (selectedConnection) {
        selectedConnection.parent.rotation = rotationZ;
        setOnGround(selectedConnection.parent, scaleFactor);
        if (currentSession) {
            currentSession.reportClick("flip", "Y", selectedConnection.parent);
        }
    }

}

///defign and highlite the conection sphere
function doClickConnection(event) {
    if (event.source.parent.metadata && event.source.parent.metadata.inModel) {
        ///do not allow to change model if need to delete
        if (currentSession ) {
            let delButton = (near.children).filter(b => b.name == "delete")[0];
            if (delButton.isVisible) {
                console.log("we can't allow to change model [in doModelConnection] when need to delete");
                currentSession.doFbMessage("יש למחוק קודם את האבן השגויה", null);
                return;
            }
        }
        doModelConnection(event.source);
        if (currentSession) {
            currentSession.reportClick("point", "on-model", event.source.parent);
        }
        return;
    } else {
        doElementConnection(event.source);
        if (currentSession) {
            currentSession.reportClick("point", "on-menu", event.source.parent);
        }

    }
}

///the first block is the model and all other blocks are its childs
function modelBySphere(sphere) {
    if (sphere.parent.metadata.blockNum == 0) {
        return sphere.parent;
    } else {
        return sphere.parent.parent;
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
    let newModel = modelBySphere(connectionSphere);
    //console.log("newModel.metadata.modelName: " + newModel.metadata.modelName);

    if (getModelSelectedConnection(currentModel) && connectionSphere !== getModelSelectedConnection(currentModel)) {
        ///there is another selected sphere so changedit to not-yellow
        getModelSelectedConnection(currentModel).material.diffuseColor = notSelectedColor;
    }
    currentModel = newModel;
    ///write the new sphere as sectedConnectin
    setModelSelectedConnection(newModel, connectionSphere);

    let m = getModelSelectedConnection(newModel).material;
    if (m.diffuseColor == selectedColor) {
        m.diffuseColor = notSelectedColor;
        setModelSelectedConnection(newModel, null);
    } else {
        m.diffuseColor = selectedColor;
    }
}

///CREATE ELEMENTS (USED FOR MENU)
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