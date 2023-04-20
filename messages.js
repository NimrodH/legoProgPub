"use strict"
class Messages {

    plane = BABYLON.Mesh.CreatePlane("plane", 10);
    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this.plane);
    currentScreen = "init";

    constructor() {
        this.plane.position.z = -25;
        this.plane.position.y = 2;
        this.plane.position.x = 0;
        this.plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;///without ir its mirror
        this.textField = new BABYLON.GUI.TextBlock("upperText");

        this.advancedTexture.background = 'green'

        var button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "המשך");
        button1.width = 1;
        button1.height = 0.4;
        button1.color = "white";
        button1.fontSize = 50;
        button1.background = "green";
        button1.onPointerUpObservable.add(this.screenDone.bind(this));
        button1.top = "90px";
        button1.left = "10px";
        button1.height = "70px";
        this.advancedTexture.addControl(button1);
     
        const initialText = "במסך זה יופיעו הנחיות\n\n הביטי/הבט מימנך נמצאת שם קוביה קטנה - זה המודל\n מאחוריך מספר לבנים לבניית המודל\n\n[אחרי שראינו את המודל והאבנים יש להקליק על כפתור [המשך\nהקלקה פרושה להצביע עם הקרן על הכפתור וללחוץ על ההדק";
        let text1 = this.textField; 
        text1.text = initialText;//"Hello world";
        text1.color = "white"//"red";
        text1.fontSize = 36;
        text1.top = "-350px";
        text1.height = "600px"
        this.advancedTexture.addControl(text1);

        //this.advancedTexture.focusedControl = inputTextArea;///create bug
        //plane.isVisible = true;
        //plane.dispose();
    }

    screenDone() {
        switch (this.currentScreen) {
            case "init":
                console.log("init")
                this.showEditID();
                break;
                case "editID":
                    console.log("editID")
                    this.doneEditID();
                    this.showEditGroup();
                    break;
                case "editGroup":
                    console.log("editID")
                    this.doneEditGroup();
                    this.showInsButtons()
                    console.log("se: " + currentSession.group);
                    break;
                
            default:
                console.log("default: " + this.currentScreen);
                break;
        }
    }

    showEditID() {
        this.currentScreen = "editID";
        this.textField.text = "יש להקליק בתוך השדה השחור. תופיע מקלדת\nיש לקליק בה את המספר שקבלת ממנהלת הניסוי"

        let inputTextArea = new BABYLON.GUI.InputText('id', "");
        inputTextArea.height = "40px";
        inputTextArea.color = "white";
        inputTextArea.fontSize = 48;
        inputTextArea.top = "-120px";
        inputTextArea.height = "70px";
        inputTextArea.width = "200px";
        this.advancedTexture.addControl(inputTextArea);

        const keyboard = new BABYLON.GUI.VirtualKeyboard("vkb");
        keyboard.addKeysRow(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "\u2190"]);
        keyboard.connect(inputTextArea);
        keyboard.top = "-10px";
        keyboard.scaleY = 2;
        keyboard.scaleX = 2;
        //keyboard.left = "10px";
        this.advancedTexture.addControl(keyboard);
    }
    doneEditID(){
        let idInputfield = this.advancedTexture.getControlByName("id");
        currentSession = new Session(idInputfield.text);
        this.advancedTexture.removeControl(idInputfield);
        idInputfield.dispose();
        let idKeyboard = this.advancedTexture.getControlByName("vkb");
        this.advancedTexture.removeControl(idKeyboard);
        idKeyboard.dispose();
    }

    showEditGroup(){
        this.currentScreen = "editGroup";
        this.textField.text = "[יש לקליק את אות הקבוצה שקבלת ממנהלת הניסוי ואז להקליק [המשך"

        let inputTextArea = new BABYLON.GUI.InputText('group', "");
        inputTextArea.height = "40px";
        inputTextArea.color = "white";
        inputTextArea.fontSize = 48;
        inputTextArea.top = "-120px";
        inputTextArea.height = "70px";
        inputTextArea.width = "200px";
        this.advancedTexture.addControl(inputTextArea);

        const keyboard = new BABYLON.GUI.VirtualKeyboard("vkb");
        keyboard.addKeysRow(["A", "B", "C", "D", "E", "F", "\u2190"]);
        keyboard.connect(inputTextArea);
        keyboard.top = "-10px";
        keyboard.scaleY = 2;
        keyboard.scaleX = 2;
        //keyboard.left = "10px";
        this.advancedTexture.addControl(keyboard);
    }

    doneEditGroup(){
        let idInputfield = this.advancedTexture.getControlByName("group");
        currentSession.group = idInputfield.text;
        this.advancedTexture.removeControl(idInputfield);
        idInputfield.dispose();
        let idKeyboard = this.advancedTexture.getControlByName("vkb");
        this.advancedTexture.removeControl(idKeyboard);
        idKeyboard.dispose();
    }

    showSelectElement(){
        
    }

    showInsButtons(){
        this.currentScreen = "InsButtons";
        near.isVisible = true;
    }
}
