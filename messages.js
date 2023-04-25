"use strict"
class Messages {

    plane = BABYLON.Mesh.CreatePlane("plane", 10);
    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this.plane);
    currentScreen = "init";

    constructor() {
        this.plane.position.z = -25;
        this.plane.position.y = 2;
        this.plane.position.x = 0;
        this.plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;///without iא its mirror
        this.textField = new BABYLON.GUI.TextBlock("upperText");

        this.advancedTexture.background = 'green'


        var button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "המשך");
        button1.width = 1;
        button1.height = 0.4;
        button1.color = "white";
        button1.fontSize = 50;
        button1.background = "green";
        button1.onPointerUpObservable.add(this.screenDone.bind(this));
        button1.top = "90px";//90
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
                this.showEditID();
                break;
            case "editID":
                this.doneEditID();
                this.showEditGroup();
                break;
            case "editGroup":
                this.doneEditGroup();
                this.showSelectBlock()
                break;
            case "selectBlock":
                this.showInsButtons();
                break;
            case "insButtons":
                this.showConnect();
                break;
            case "connect":
                currentSession.initSession();
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
    doneEditID() {
        let idInputfield = this.advancedTexture.getControlByName("id");
        currentSession = new Session(idInputfield.text);
        this.advancedTexture.removeControl(idInputfield);
        idInputfield.dispose();
        let idKeyboard = this.advancedTexture.getControlByName("vkb");
        this.advancedTexture.removeControl(idKeyboard);
        idKeyboard.dispose();
    }

    showEditGroup() {
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

    doneEditGroup() {
        let idInputfield = this.advancedTexture.getControlByName("group");
        currentSession.group = idInputfield.text;
        this.advancedTexture.removeControl(idInputfield);
        idInputfield.dispose();
        let idKeyboard = this.advancedTexture.getControlByName("vkb");
        this.advancedTexture.removeControl(idKeyboard);
        idKeyboard.dispose();
    }

    showSelectBlock() {
        this.currentScreen = "selectBlock";
        this.textField.text = "ניתן לבחור אחת מהאבני הבניין שמאחוריך \nעל ידי הקלקה על אחת הבליטות המופיעות בה\n הבליטה תיצבע בצהוב\n\nבבקשה לבחור אבן ואז להקליק [המשך] במסך זה"

    }

    showInsButtons() {
        this.currentScreen = "insButtons";
        near.isVisible = true;
        this.textField.text = "מעל האבנים מופיע עכשיו מאחוריך פאנל כחול עם כפתורים\n ניתן לגרור אותו לכל מקום במסך\nהכפתורים יפעלו על האבן שנבחרה:\n\n [ red ] כפתורים לבחירת צבע לדוגמא \n  אבן שוכבת אופקית [ / ]\nאבן עומדת [ | ]\nאבן שוכבת אנכית [ -- ] "
    }

    showConnect() {
        this.currentScreen = "connect";
        this.textField.text = "להוספת האבן למודל יש להקליק על אחת הבליטות במודל\n[ << ] כאשר נקודה במודל ונקודה באבן נבחרו, ללחוץ על כפתור\nהאבן תוצמד למודל כך שהנקודות שנבחרו באבן ובמודל יתלכדו \n\n[ >> ] להסרת האבן האחרונה שהוספת למודל יש ללחוץ על כפתור"
    }


}
/*
class FbMessages {
    font_size = 24; 
    font = "bold " + this.font_size + "px Arial"; 
    planeHeight = 0.5; 
    //Set height for dynamic texture
    DTHeight = 1.5 * this.font_size; //or set as wished
    //Calcultae ratio
    ratio = this.planeHeight / this.DTHeight;
    dynamicTexture;
    constructor() {
        //Set font
        
        

        //Set height for plane
       

 
        //Set text
        var text = "שלום רב שובך ציפורה נחמדת";

        //Use a temporay dynamic texture to calculate the length of the text on the dynamic texture canvas
        var temp = new BABYLON.DynamicTexture("DynamicTexture", 64, scene);
        var tmpctx = temp.getContext();
        tmpctx.font = this.font;
        this.DTWidth = tmpctx.measureText(text).width + 8;

        //Calculate width the plane has to be 
        var planeWidth = DTWidth * this.ratio;

        //Create dynamic texture and write the text
        this.dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", { width: DTWidth, height: this.DTHeight }, scene, false);
        //var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", { width: 2, height: 2 }, scene, false);
        var mat = new BABYLON.StandardMaterial("mat", scene);
        mat.diffuseTexture = dynamicTexture;
        dynamicTexture.drawText(text, null, null, this.font, "#000000", "#ffffff", true);

        //Create plane and set dynamic texture as material
        var plane = BABYLON.MeshBuilder.CreatePlane("plane", { width: planeWidth, height: this.planeHeight }, scene);
        plane.material = mat;
        plane.position.y = 3;
        plane.position.z = 1;
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
    }
}
*/

class FbMessages {
    dynamicTexture;
    mat;
    plane;
    constructor(text) {
        //Set font
        var font_size = 24;
        var font = "bold " + font_size + "px Arial";

        //Set height for plane
        var planeHeight = 0.5;

        //Set height for dynamic texture
        var DTHeight = 1.5 * font_size; //or set as wished

        //Calcultae ratio
        var ratio = planeHeight / DTHeight;

        //Set text
        //text = "שלום רב שובך ציפורה נחמדת";

        //Use a temporay dynamic texture to calculate the length of the text on the dynamic texture canvas
        var temp = new BABYLON.DynamicTexture("DynamicTexture", 64, scene);
        var tmpctx = temp.getContext();
        tmpctx.font = font;
        var DTWidth = tmpctx.measureText(text).width + 8;
        temp.dispose();
        //Calculate width the plane has to be 
        var planeWidth = DTWidth * ratio;

        //Create dynamic texture and write the text
        this.dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", { width: DTWidth, height: DTHeight }, scene, false);
        this.mat = new BABYLON.StandardMaterial("mat", scene);
        this.mat.diffuseTexture = this.dynamicTexture;
        this.dynamicTexture.drawText(text, null, null, font, "#000000", "#ffffff", true);

        //Create plane and set dynamic texture as material
        this.plane = BABYLON.MeshBuilder.CreatePlane("plane", { width: planeWidth, height: planeHeight }, scene);
        this.plane.material = this.mat;
        this.plane.position.y = 1.5;
        this.plane.position.z = 2;
        this.plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
    }
    hide(){
        this.plane.isVisible = false;  
    }
    show(){
        this.plane.isVisible = true;  
    }
    dispose() {
        dynamicTexture.dispose();
        mat.dispose();
        plane.dispose();    
    }
}
