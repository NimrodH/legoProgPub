"use strict"
class Messages {

    plane = BABYLON.Mesh.CreatePlane("plane", 10);
    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this.plane);
    currentScreen = "init";
    constructor() {

        this.plane.position.z = -25;
        this.plane.position.y = 2;
        this.plane.position.x = 0;
        //this.plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this.plane);

        var button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "המשך");
        button1.width = 1;
        button1.height = 0.4;
        button1.color = "white";
        button1.fontSize = 50;
        button1.background = "green";
        button1.onPointerUpObservable.add(this.nextScreen);
        button1.top = "60px";
        button1.left = "10px";
        button1.height = "70px";
        this.advancedTexture.addControl(button1);


        //const plane = BABYLON.MeshBuilder.CreatePlane("plane", { height: 2, width: 2 });

        //var this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);
        //var this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.advancedTexture.background = 'green'

        //const initialText = "במסך זה יופיעו הנחיות.\n מימנך נמצאת קוביה קטנה - זה המודל.\n מאחוריך מספר לבנים.\n עכשו יש להקליק על כפתור המשך.\n הקלקה פרושה להצביע עם הקרן וללחוץ על ההדק ";
        const initialText = "בוקר טוב";
        // some example text. \nIt's quite long, so will need to be displayed across multiple lines. \n\nIt also has several line breaks.";
        //this.advancedTexture.drawText(initialText)
        //this.advancedTexture.drawText(initialText, 1000, 500, "36px Arial", "black", "white", true, true);

        // The "\n" in the text indicates a line break
        // Line breaks are added by pressing 'return' when editing text

        let inputTextArea = new BABYLON.GUI.InputTextArea('id', "your id");
        inputTextArea.height = "40px";
        inputTextArea.color = "white";
        inputTextArea.fontSize = 48;
        inputTextArea.top = "-70px";
        inputTextArea.height = "70px";
        //this.advancedTexture.addControl(inputTextArea);

        const keyboard = new BABYLON.GUI.VirtualKeyboard();
        keyboard.addKeysRow(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "\u2190"]);
        keyboard.connect(inputTextArea);
        keyboard.top = "10px";
        //keyboard.left = "10px";
       // this.advancedTexture.addControl(keyboard);

        const text1 = new BABYLON.GUI.TextBlock("upperText");
        text1.text = initialText;//"Hello world";
        text1.color = "red";
        text1.fontSize = 36;
        text1.top = "-400px";
        text1.height = "600px"
        this.advancedTexture.addControl(text1);

        //this.advancedTexture.focusedControl = inputTextArea;
        //plane.isVisible = true;
        //plane.dispose();
        //console.log("but1: " + this.advancedTexture.getControlByName("but1").width);

    }
    nextScreen() {
        switch (this.currentScreen) {
            case "init":
                this.currentScreen = "id_group";
                break;
        
            default:
                break;
        }
    }
    showMessage(theText) {
        this.advancedTexture.getControlByName("upperText").text = theText;
    }
}
