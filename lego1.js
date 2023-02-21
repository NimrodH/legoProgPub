"use strict" 
/////////////////// GAME GLOBAL VERIABLES //////////////////////////
const notSelectedColor = new BABYLON.Color3(1, 0, 1);//pink
const selectedColor = new BABYLON.Color3(1, 1, 0);//yellow
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

function setSelectedConnectionColor(r, g, b) {
    sendMessage({ "R": r });
    if (selectedConnection) {
        selectedConnection.parent.material.diffuseColor = new BABYLON.Color3(r, g, b);
    }
}
function colorBlue() {
    setSelectedConnectionColor(0, 0, 1);
}
function colorRed() {
    setSelectedConnectionColor(1, 0, 0);
}
function colorBlack() {
    setSelectedConnectionColor(0, 0, 0);
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
    let selectedConnectionMame = selectedConnection.name;
    doConnect(newElement, newColor, selectedConnectionMame);
}

function reBuildModel(modelData) {
    for (let index = 0; index < array.modelData; index++) {
        const element = modelData[index];
        const inDataBlockName = element.type;
        const inDataConnectionName = element.srcPoint;
        let converted = convertBlockAndsphereNames(inDataBlockName, inDataConnectionName);///helper function
        let srcBlockName = converted.newBlockName;
        let srcConnection = converted.newSphereName;
        //TODO: use converted block name to create new element (will be sent to doConnect)
        const inDataColor = element.color;
        //TODO: create color following the data (will be sent to doConnect)
        let blockColor;
        //TODO: set oriantation of the new element
        
        ///set the selected connection on model (global variable)
        const inDatasDestBlock = element.destBlock;
        const inDatasDestPoint = element.inDatasDestPoint;
        let s = destSphereByOldData(inDatasDestBlock, inDatasDestPoint);
        //console.log("s.name: " + s.name)
        setModelSelectedConnection(currentModel, s);

        ////doConnect(newElement, newColor, selectedConnectionMame)
     }

    function convertBlockAndsphereNames() {
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
}

function destSphereByOldData(blockNumber, destPoint) {
    ///find block object by number and then find שמג RETURN  sphere object by the block name

    let modelBlocks = currentModel.getChildren();

    //console.log(modelBlocks.metadata.blockNum);
    let destBlock = modelBlocks.filter(byBlockNum)[0];
    let destBlockName = destBlock.name;
    console.log(destBlockName);
    let sphereName = getDestPointFullNameOnModel(destBlockName, destPoint);
    console.log("sphereName: " + sphereName);
    let sphers = destBlock.getChildren();
    let selectedSphere = sphers.filter(bySphereName)[0];
    

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

    function byBlockNum(e) {
        if (e.metadata) {
            return e.metadata.blockNum == blockNumber;
        } else {
            return false;
        }
        
    }

    function bySphereName(e) {
        if (e.name) {
            return e.name == sphereName;
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
        let firstDot = element.name.indexOf(".") + 1;
        let elementPrivateName = element.name.substr(firstDot);
        console.log("elementPrivateName: " + elementPrivateName);
        ///element.name is like b33.p-1 while selectedConnectionMame is like p-1 without prefix
        if (elementPrivateName == selectedConnectionMame) {
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
        connection: newElementConnection, //selectedConnection,
        connectedTo: getModelSelectedConnection(currentModel)
    };
    currentModel.metadata.numOfBlocks = currentModel.metadata.numOfBlocks + 1;
    getModelSelectedConnection(currentModel).scaling = new BABYLON.Vector3(0.9, 0.9, 0.9);
    ///TODO:rescale if removing block
    setModelSelectedConnection(currentModel, null);
    reportConnect(newElement);///newElement has connectedTo object
}
///turn the elemets
function flipModel() {
    currentModel.rotation.x = 0;
    currentModel.rotation.y = 0;
    currentModel.rotation.z = Math.PI / 2;
    /*
    let array = currentModel.getChildren()
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (element.metadata){
            console.log("connection id: " + element.metadata.connection.parent.id)//////////////////////
            console.log("connectedTo id: " + element.metadata.connectedTo.id)//////////////////////
            console.log("connection name: " + element.metadata.connection.parent.name)//////////////////////
            console.log("connectedTo name: " + element.metadata.connectedTo.name)//////////////////////
            console.log("name: " + element.name)///
        }
        //console.log("name: " + currentModel.name)//
   }
   */
}

function flipZ() {
    if (selectedConnection) {
        selectedConnection.parent.rotation.x = 0
        selectedConnection.parent.rotation.y = 0
        selectedConnection.parent.rotation.z = Math.PI / 2;
    }

}
function flipX() {
    if (selectedConnection) {
        selectedConnection.parent.rotation.z = 0
        selectedConnection.parent.rotation.y = 0
        selectedConnection.parent.rotation.x = Math.PI / 2;
        //selectedConnection.parent.rotation.x = 0;///not work for sphere
    }

}
function flipY() {
    if (selectedConnection) {
        selectedConnection.parent.rotation.z = 0
        selectedConnection.parent.rotation.x = 0
        selectedConnection.parent.rotation.y = Math.PI / 2;
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
    myMaterial.diffuseColor = new BABYLON.Color3(0.54, 0.13, 0.54);
    wheel.material = myMaterial;
    wheel.rotation.x = Math.PI / 2;
    addMeshContactSphere(wheel, 0);
    return wheel;
}

///create rectangle element (block)
function meshBlock(scene, blockWidth) {
    const box = BABYLON.MeshBuilder.CreateBox("b" + blockWidth, { width: blockWidth, height: 1 });
    const myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
    myMaterial.diffuseColor = new BABYLON.Color3(0.54, 0.13, 0.54);
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