"use strict"
///contains:
/// class Messages (squre with controls behind) 
/// class FbMessages (one line of text in front)
/// class Timer 
var currentFbMessage = null;

class Messages {

    plane = BABYLON.Mesh.CreatePlane("plane", 10);
    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this.plane);
    currentScreen = "init";
    nextButton;///also sent as parameter in new session and called from there
    constructor(messageType = null) {
        this.messageType = messageType;
        this.plane.position.z = -25;
        this.plane.position.y = 2.7;/////2
        this.plane.position.x = 0;
        this.plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;///without iא its mirror

        this.textField = new BABYLON.GUI.TextBlock("upperText");

        this.advancedTexture.background = 'green'


        this.nextButton = BABYLON.GUI.Button.CreateSimpleButton("but1", "המשך");
        this.nextButton.width = 0.5;
        this.nextButton.height = 0.4;
        this.nextButton.color = "white";
        this.nextButton.fontSize = 50;
        this.nextButton.background = "green";
        this.nextButton.onPointerUpObservable.add(this.screenDone.bind(this));
        this.nextButton.top = "120px";//90
        this.nextButton.left = "10px";
        this.nextButton.height = "70px";
        this.advancedTexture.addControl(this.nextButton);


        this.addColorChooseButtons();

        this.text_part1_autoColor = `
                    
                    

        
                    לפניך שני בסיסים לבנייה מימין ומשמאל

ובהמשך יופיעו עוד שני בסיסים מאחורי אבני הבניין .  בחר האם

תרצה שהמערכת תבחר עבורך את צבעי החלקים באופן אוטומטי

אבל תתווסף לתוצאה שלך תוספת זמן של 3 דקות.  לדוגמא

אם תסיים את שלב ב' תוך 9 דקות, הזמן שייחשב לציון הסופי

יהיה 12 דקות. או או שתבחר את הצבעים בעצמך, כמו בתרגול

ואז הזמן שיירשם הוא הזמן המדויק שתבצע בפועל, ללא תוספות

`
        this.text_part1_manualColor = `




לפניך שני בסיסים לבנייה מימין ומשמאל

ובהמשך יופיעו עוד שני בסיסים מאחורי אבני הבניין.

.בשלב זה עליך לבחור את הצבעים בעצמך כמו בתרגול



ניתן להתחיל בבנייה  עכשיו
`
        this.text_part2_manualColor_1 = `

ביצעת את המשימה ללא היכולת שהמערכת תבחר עבורך את הצבע

באפשרותך להמשיך כפי שפעלת עד כה ולבצע את בחירת הצבעים בעצמך

או לשנות את ההחלטה ולקבל את היכולת שהמערכת תבצע עבורך 

את בחירת הצבעים באופן אוטומטי
`
        this.text_part2_manualColor_2 = `
        
אם תבחר/י לרכוש את היכולת שהמערכת תבצע עבורך 

את בחירת הצבעים באופן אוטומטי,  תתווסף באופן אוטומטי

.תוספת של 2 דקות לזמן הביצוע שלך כפי שיירשם במערכת

אם תבחר לבצע את הבחירה בעצמך, ההמשך יתבצע כמו בתרגול

.והזמן שיירשם יהיה זמן מדויק, ללא תוספת 

בחר את הדרך שבה ברצונך להמשיך:
`

        this.text_part2_autoColor_1 = `

השתמשת ביכולת שהמערכת בחרה עבורך את הצבעים באופן אוטומטי 

 .ובשל כך נוספו לזמן שלך 3 דקות

כעת, תוכל לבחור אם להמשיך להשתמש ביכולת האוטומטית לבחירת הצבע

.או לבצע את שלב ב' ללא תמיכה אוטומטית ולבחור את הצבעים בעצמך



(לחץ המשך)

`

        this.text_part2_autoColor_2 = `


אם תבחר להמשיך עם היכולת

תתווסף הפעם תוספת של 2 דקות לזמן הביצוע שלך.

אם תבחר לבצע את הבחירה בעצמך, שלב ב' יתבצע כמו בתרגול

והזמן שיירשם יהיה זמן מדויק, ללא תוספת. 






בחר את הדרך שבה ברצונך להמשיך:

`


        const initialText = "במסך זה יופיעו הנחיות" + "\n" + 
            "מאחוריך מספר לבנים לבניית המודל" + "\n" + 
            "[אחרי שראינו את האבנים יש להקליק על כפתור [המשך" + "\n" + 
            "הקלקה פרושה להצביע עם הקרן על הכפתור וללחוץ על ההדק";

        let text1 = this.textField;
        text1.text = initialText;//"Hello world";
        text1.color = "white"//"red";
        text1.fontSize = 34;
        text1.top = "-300px";
        text1.height = "660px"
        this.advancedTexture.addControl(text1);
        ///listen to this event and set the nextButton state
        addEventListener("reportClick", this.handleReportClick.bind(this))
        //this.advancedTexture.focusedControl = inputTextArea;///create bug
        //plane.isVisible = true;
        //plane.dispose();
    }

    showColorChooseButtons() {
        this.hideNextButton();
        this.autoColorButton.isVisible = true;
        this.manualColorButton.isVisible = true;
    }

    hideColorChooseButtons() {
        this.autoColorButton.isVisible = false;
        this.manualColorButton.isVisible = false;
    }

    hideNextButton() {
        this.nextButton.isVisible = false;
    }

    showNextButton() {
        this.nextButton.isVisible = true;
    }

    addColorChooseButtons() {
        // Create and hide color choice buttons

        this.autoColorButton = BABYLON.GUI.Button.CreateSimpleButton(
            "autoColorBtn",
            "שהמערכת תבחר את הצבעים עבורי "
        );
        this.autoColorButton.width = 0.8;
        this.autoColorButton.height = "70px";
        this.autoColorButton.color = "white";
        this.autoColorButton.fontSize = 44;
        this.autoColorButton.background = "green";
        this.autoColorButton.top = "120px";
        this.autoColorButton.left = "10px";
        this.autoColorButton.onPointerUpObservable.add(this.handleAutoColorClick.bind(this));
        this.advancedTexture.addControl(this.autoColorButton);

        this.manualColorButton = BABYLON.GUI.Button.CreateSimpleButton(
            "manualColorBtn",
            "מעדיף/ה לבחור את הצבעים בעצמי"
        );
        this.manualColorButton.width = 0.8;
        this.manualColorButton.height = "70px";
        this.manualColorButton.color = "white";
        this.manualColorButton.fontSize = 44;
        this.manualColorButton.background = "green";
        this.manualColorButton.top = "210px";
        this.manualColorButton.left = "10px";
        this.manualColorButton.onPointerUpObservable.add(this.handleManualColorClick.bind(this));
        this.advancedTexture.addControl(this.manualColorButton);

        this.autoColorButton.isVisible = false;
        this.manualColorButton.isVisible = false;
    }

    handleReportClick(e) {
        if (currentSession && currentSession.part == "learning") {
            if (currentSession) {
                console.log(this.currentScreen)
            }

            if (e.detail.action == "point" && e.detail.details == "on-menu" && e.detail.newElement.name == 'b5' && this.currentScreen == "selectBlock") {
                this.nextButton.isEnabled = true;
            }
            if (e.detail.action == "color" && e.detail.details == "red" && this.currentScreen == "colorButtons") { //&& e.detail.details == "red"
                this.nextButton.isEnabled = true;
            }
            if (e.detail.action == "flip" && e.detail.details == "Y" && this.currentScreen == "rotateButtons") {
                this.nextButton.isEnabled = true;
            }
            if (e.detail.action == "point" && e.detail.details == "on-model" && this.currentScreen == "modelScreen" && e.detail.newElement.metadata.modelTitle == "M1") {
                this.nextButton.isEnabled = true;
            }
            if (e.detail.action == "connect") {
                this.nextButton.isEnabled = true;
            }


        }
    }
    ///switch screens by currentScreen. convention:
    /// use function show<CurrentScreen> to show the new screen
    /// use function done<CurrentScreen> if the screen need dispose objects or implemnt user data
    screenDone() {
        switch (this.currentScreen) {
            case "init":
                //this.showPic();/////
                this.showEditID();
                break;
            case "editID":
                let id = this.doneEditID();
                if (id == "record") {
                    this.showModel2record();
                } else {
                    if (id == "takePics") {
                        this.showModel2takePics();
                        //currentSession.initSession();
                    } else {
                        this.showEditGroup();
                    }
                }
                break;
            case "model2record":
                this.doneModel2record();
                break;
            case "model2takePics":
                this.doneModel2takePics();
                break;
            case "editGroup":
                let group = this.doneEditGroup();
                this.showSelectBlock()
                break;
            case "selectBlock":
                this.showColorButtons();
                break;
            case "colorButtons":
                this.showRotateButtons();
                break;
            //this.showConnect();
            case "rotateButtons":
                //////currentSession.initSession();
                currentModel = createModel("car", "M1", 5, 0, -5);//////
                this.showModelScreen();
                break;
            case "modelScreen":
                //this.showGroupIstructions();
                this.showTrainingScreen();
                break;
            case "trainingScreen":
                //this.showGroupIstructions();
                disposeModels();
                currentSession.initSession();
                this.showConnect();
                this.currentScreen = "end";
                break;
            case "part2_1":
                this.showPart2_2()
                break;
            case "part2_2":
                currentSession.initPart2();//////////////
                ////////////////let buyTime = this.donePart2();///donePart2 will send user answer to database but 
                ///we don't know yet the answer (session will triger it later) so we dont call any screen
                ////was currentSession.initExamA();
                //////////////////this.nextButton.isEnabled = true;///false;  true: we want to allow retry 
                this.hideNextButton();
                break;
            case "startPart2":
                currentSession.initPart2();
                this.nextButton.isEnabled = false;
                break;
            case "examA":
                //this.showConnect();
                currentSession.initExamA();
                this.nextButton.isEnabled = false;
                break;
            case "examB":
                //this.showConnect();
                currentSession.initExamB();
                this.nextButton.isEnabled = false;
                break;
            default:
                console.log("default: " + this.currentScreen);
                break;
        }
    }

    showPic() {
        console.log("in showPic");
        this.textField.text = "foo";
        let image = new BABYLON.GUI.Image("but");
        image.source = "textures/pink_py.png";
        ////image.heightInPixels = 1000;
        //image.widthInPixels = 1000; 
        //image.top = "20px";   
        this.advancedTexture.addControl(image);
        console.log("image.top: " + image.top)
    }

    showEditID() {
        this.currentScreen = "editID";
        this.textField.text = "יש ללחוץ (להקליק) בתוך השדה השחור" + "\n" + "" + "\n" +
            "לאחר שנפתחה המקלדת, יש להזין את " + "\n" +
            "המספר שקיבלת ממנהלת הניסוי " + "\n" + "" + "\n" +
            "לסיום לחצ/י המשך"

        this.nextButton.isEnabled = false;

        let inputTextArea = new BABYLON.GUI.InputText('id', "");
        inputTextArea.height = "40px";
        inputTextArea.color = "white";
        inputTextArea.fontSize = 48;
        inputTextArea.top = "-120px";
        inputTextArea.height = "70px";
        inputTextArea.width = "200px";
        inputTextArea.onTextChangedObservable.add(() => this.nextButton.isEnabled = true);
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
        let theId = idInputfield.text;
        //console.log("theId: " + theId);
        this.advancedTexture.removeControl(idInputfield);
        idInputfield.dispose();
        let idKeyboard = this.advancedTexture.getControlByName("vkb");
        this.advancedTexture.removeControl(idKeyboard);
        idKeyboard.dispose();
        if (theId == "record") {
            ///no session. will continue in showModel2record when we will return "record"
        }
        else {
            currentSession = new Session(theId);
        }
        return theId;
    }
    /////RECORD MODE without session
    showModel2record() {
        this.currentScreen = "model2record";
        near = createNearMenu("record");
        /////near.isVisible = true;

        this.textField.text = "שם המודל"

        let inputTextArea = new BABYLON.GUI.InputText('id', "");
        inputTextArea.height = "40px";
        inputTextArea.color = "white";
        inputTextArea.fontSize = 48;
        inputTextArea.top = "-120px";
        inputTextArea.height = "70px";
        inputTextArea.width = "200px";
        this.advancedTexture.addControl(inputTextArea);

        const keyboard = new BABYLON.GUI.VirtualKeyboard("vkb");
        keyboard.addKeysRow(["man", "car", "dog", "chair", "\u2190"]);
        keyboard.connect(inputTextArea);
        keyboard.top = "-10px";
        keyboard.scaleY = 2;
        keyboard.scaleX = 2;
        //keyboard.left = "10px";
        this.advancedTexture.addControl(keyboard);

    }

    doneModel2record() {
        this.currentScreen = "end";
        let idInputfield = this.advancedTexture.getControlByName("id");
        let theId = idInputfield.text;
        currentModel = createModel(theId, "for record", -5, 0, -5);
        this.advancedTexture.removeControl(idInputfield);
        idInputfield.dispose();
        let idKeyboard = this.advancedTexture.getControlByName("vkb");
        this.advancedTexture.removeControl(idKeyboard);
        idKeyboard.dispose();
        return theId;
    }
    /////END RECORD MODE without session

    showModel2takePics() {
        this.currentScreen = "model2takePics";
        near = createNearMenu("takePics");///for now create regular no record menu
        /////near.isVisible = true;

        this.textField.text = "שם המודל"

        let inputTextArea = new BABYLON.GUI.InputText('id', "");
        inputTextArea.height = "40px";
        inputTextArea.color = "white";
        inputTextArea.fontSize = 48;
        inputTextArea.top = "-120px";
        inputTextArea.height = "70px";
        inputTextArea.width = "200px";
        this.advancedTexture.addControl(inputTextArea);

        const keyboard = new BABYLON.GUI.VirtualKeyboard("vkb");
        keyboard.addKeysRow(["man", "car", "dog", "chair", "\u2190"]);
        keyboard.connect(inputTextArea);
        keyboard.top = "-10px";
        keyboard.scaleY = 2;
        keyboard.scaleX = 2;
        //keyboard.left = "10px";
        this.advancedTexture.addControl(keyboard);

    }

    doneModel2takePics() {
        this.currentScreen = "end";
        let idInputfield = this.advancedTexture.getControlByName("id");
        let theId = idInputfield.text;

        currentModel = createModel(theId, " ", -5, 0, 0);//-3
        rebuild4pics();
        currentModel.metadata.labelObj.hide();
        this.advancedTexture.removeControl(idInputfield);
        idInputfield.dispose();
        let idKeyboard = this.advancedTexture.getControlByName("vkb");
        this.advancedTexture.removeControl(idKeyboard);
        idKeyboard.dispose();
        return theId;
    }
    /////END TAKEPICS MODE without session
    showEditGroup() {
        ///every one use group B now

        currentSession.group = "B";
        this.showSelectBlock()
    }
    /*
        doneEditGroup() {
            let idInputfield = this.advancedTexture.getControlByName("group");
            let theGroup = idInputfield.text;
            currentSession.group = theGroup;
            this.clearEditGroupScreen()
            return theGroup;
        }
    
        clearEditGroupScreen() {
            this.textField.text = "ממתין מחדש לבן הזוג";///needed for return with 9
            let idInputfield = this.advancedTexture.getControlByName("group");
            this.advancedTexture.removeControl(idInputfield);
            idInputfield.dispose();
            let idKeyboard = this.advancedTexture.getControlByName("vkb");
            this.advancedTexture.removeControl(idKeyboard);
            idKeyboard.dispose();
        }
    */
    showSelectBlock() {
        this.currentScreen = "selectBlock";
        this.textField.text = "ניתן לבחור את אחת מאבני הבניין שמאחוריך" + "\n" + "על ידי לחיצה (הקלקה) על אחת מן הבליטות" + "\n" + " המופיעות על גבי האבן" + "\n" + " לחיצה תצבע את הבליטה בצבע צהוב" + "\n" + "" + "\n" + "נא בחר/י את האבן הארוכה ביותר" + "\n" + " ואז לחצ/י על המשך"
        if (enforceTraining) {
            this.nextButton.isEnabled = false;//////to allow only after clicking
        }

    }

    showColorButtons() {
        this.currentScreen = "colorButtons";
        near = createNearMenu("no record"); //was ////N1/5 for screenshots
        //near = {}; ////N1/5 (=without comment)
        /////near.isVisible = true;
        //    this.textField.text = "מעל האבנים מופיע עכשיו מאחוריך פאנל כחול עם כפתורים" + "\n" + " ניתן לגרור אותו לכל מקום במסך" + "\n" + "" + "\n" + "הכפתורים יפעלו על האבן שנבחרה:" + "\n" + "" + "\n" + " [ red ] כפתורים לבחירת צבע לדוגמא " + "\n" + "  אבן שוכבת אופקית [ / ]" + "\n" + "אבן עומדת [ | ]" + "\n" + "אבן שוכבת אנכית [ -- ] "
        this.textField.text = "מעל אבני הבניין, מופיע לוח עם כפתורים שונים" + "\n" + " שישמשו אותך לאורך הניסוי" + "\n" + "" + "\n" + "נא לחצ/י על כפתור" + "\n" + " לבחירת צבע אדום לאבן" + "\n" + " [red] "
        if (enforceTraining) {
            this.nextButton.isEnabled = false;
        }
    }

    showRotateButtons() {
        this.currentScreen = "rotateButtons";
        this.textField.text = "" + "\n" + " לרשותך גם כפתורים לסיבוב האבן" + "\n" + "" + "\n" + "הכפתורים יפעלו על האבן שנבחרה:" + "\n" + "" + "\n" + " סובב/י את האבן למצב עומד על ידי בחירת כפתור מתאים " + "\n" + "  אבן שוכבת אופקית [ / ]" + "\n" + "אבן עומדת [ | ]" + "\n" + "אבן שוכבת אנכית [ -- ] "
        //    this.textField.text = "מעל האבנים מופיע עכשיו מאחוריך פאנל כחול עם כפתורים" + "\n" + " ניתן לגרור אותו לכל מקום במסך" + "\n" + "" + "\n" + "הכפתורים יפעלו על האבן שנבחרה:" + "\n" + "" + "\n" + " [ red ] כפתורים לבחירת צבע לדוגמא " + "\n" + "  אבן שוכבת אופקית [ / ]" + "\n" + "אבן עומדת [ | ]" + "\n" + "אבן שוכבת אנכית [ -- ] "
        if (enforceTraining) {
            this.nextButton.isEnabled = false;
        }
    }

    showModelScreen() {
        this.currentScreen = "modelScreen";
        if (enforceTraining) {
            this.nextButton.isEnabled = false;
        }
        /////
        this.textField.text = "משמאלך בסיס למודל" + "\n" + "" + "\n" +
            "בחר/י את המודל" + "\n" + " M1 " + "\n" +
            "על ידי לחיצה (הקלקה) על הבליטה שבו" + "\n" +
            " כך שהיא תיצבע בצבע צהוב" + "\n" + "" + "\n" +
            "לאחר מכן לחצ/י המשך";
        /*
        switch (currentSession.group) {
            case "A":
                this.textField.text = "מאחורי אבני הבניין ישנם שני בסיסים נוספים." + "\n"
                 + "נא בחר/י את המודל" + "\n" +
                 " M1" + "\n" +
                " על ידי לחיצה על הבליטה והפיכתה לצבע צהוב" + "\n" +
                 "לאחר מכן לחצ/י המשך";
                break;
            case "B":
                this.textField.text = "מימינך ומשמאלך בסיסים לשני מודלים" + "\n" + "שני מודלים נוספים יוצגו לפניך בהמשך" + "\n" + "בחר/י את המודל" + "\n" + "M1" + "\n" + "על ידי לחיצה (הקלקה) על הבליטה שבו" + "\n" + " כך שהיא תיצבע בצבע צהוב" + "\n" + "לאחר מכן לחצ/י המשך";
                break;
            case "C":
                this.textField.text = "משמאלך בסיס למודל" + "\n" + "שלושה מודלים נוספים יוצגו לפניך בהמשך" + "\n" + "" + "\n" + "בחר/י את המודל" + "\n" + " M1 " + "\n" + "על ידי לחיצה (הקלקה) על הבליטה שבו" + "\n" + " כך שהיא תיצבע בצבע צהוב" + "\n" + "" + "\n" + "לאחר מכן לחצ/י המשך";
                break;
            default:
                break;
        }
        */
    }

    showTrainingScreen() {
        if (enforceTraining) {
            this.nextButton.isEnabled = false;
        }
        this.currentScreen = "trainingScreen";
        this.textField.text = "לפני הוספת אבן למודל יש לבחור בליטה במודל" + "\n" + " ובליטה בחלק המתחבר כך שיצבעו בצבע צהוב" + "\n" + " לאחר מכן יש ללחוץ על כפתור [>>]. לאחר " + "\n" + "לחיצה על כפתור זה, האבן תוצמד למודל" + "\n" + " והנקודות שנבחרו יתלכדו" + "\n" + "" + "\n" + "להסרת האבן האחרונה שנוספה למודל " + "\n" + "יש ללחוץ על כפתור [<<].כעת " + "\n" + "חבר/י מספר אבנים למודל על פי הנחיות המנחה"
    }
    showConnect() {
        this.currentScreen = "connect";
        let msgBuySell;
        switch (currentSession.group) {
            case "A":
                this.textField.text = "מימינך ומשמאלך בסיסים לשני מודלים" + "\n" +
                    "מאחורי אבני הבניין ישנם שני בסיסים נוספים" + "\n\n" +
                    msgBuySell + "\n\n" +
                    "רק לאחר קבלת הוראה מהמנחה ניתן " + "\n" +
                    "להתחיל לבנות את המודלים בהתאם" + "\n" +
                    "להסברים שיופיעו מעל אבני הבניין. בהצלחה";
                break;
            case "B":
                console.log("in showConnect B, part: " + currentSession.part);
                if (currentSession.startAutoColor == "Allowed to choose") {
                    this.showColorChooseButtons();
                    this.textField.text = this.text_part1_autoColor;
                } else {
                    this.textField.text = this.text_part1_manualColor;
                    this.hideNextButton();
                }
                /*
                this.textField.text = "מימינך ומשמאלך בסיסים לשני מודלים" + "\n" +
                    "שני מודלים נוספים יוצגו לפניך בהמשך" + "\n" +
                    msgBuySell + "\n\n" +
                    "רק לאחר קבלת הוראה מהמנחה ניתן " + "\n" +
                    "להתחיל לבנות את המודלים בהתאם" + "\n" +
                    "להסברים שיופיעו מעל אבני הבניין. בהצלחה";
                */
                break;

            case "C":
                this.textField.text = "משמאלך שוב הבסיס למודל" + "\n" +
                    "שלושה מודלים נוספים יוצגו לפניך בהמשך" + "\n\n" +
                    msgBuySell + "\n\n" +
                    "רק לאחר קבלת הוראה מהמנחה ניתן " + "\n" +
                    "להתחיל לבנות את המודלים בהתאם" + "\n" +
                    "להסברים שיופיעו מעל אבני הבניין. בהצלחה";
                break;
            default:
                break;
        }
        if (enforceTraining) {
            this.nextButton.isEnabled = false;
        }
        currentSession.part = "training"
    }

    showPart2_1() {
        this.currentScreen = "part2_1";
        let timeToShow = Math.floor((currentSession.timer.currTime - currentSession.timer.firstTime) / 1000);
        //console.log("currentSession.timer.firstTime: " + currentSession.timer.firstTime);
        console.log("showPart2_1 currentSession.currAutoColor: " + currentSession.currAutoColor);
        let timeOfpart1 = currentSession.timer.secToTimeString(timeToShow);///was wrong: currTime
        if (currentSession.currAutoColor == "NO") { ///קונה
            const firstLine = " עד כה השקעת " + timeOfpart1 + " דקות בבנית 22 צעדים "
            const initialText = firstLine + this.text_part2_manualColor_1
            this.textField.text = initialText///to take it out we need declare initialText before as variable
        } else {/// מוכר
            const firstLine = " עד כה השקעת " + timeOfpart1 + " דקות בבנית 22 צעדים "
            const initialText = "\n" + firstLine + this.text_part2_autoColor_1
            this.textField.text = initialText
        }

        this.showNextButton();

        this.nextButton.isEnabled = true;
        /*
                let inputTextArea = new BABYLON.GUI.InputText('time4Buy', "");
                inputTextArea.height = "40px";
                inputTextArea.color = "white";
                inputTextArea.fontSize = 48;
                inputTextArea.top = "-120px";
                inputTextArea.height = "70px";
                inputTextArea.width = "200px";
                inputTextArea.onTextChangedObservable.add(() => this.nextButton.isEnabled = true);
                this.advancedTexture.addControl(inputTextArea);
        
                const keyboard = new BABYLON.GUI.VirtualKeyboard("vkb");
                keyboard.addKeysRow(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "\u2190"]);
                keyboard.connect(inputTextArea);
                keyboard.top = "-10px";
                keyboard.scaleY = 2;
                keyboard.scaleX = 2;
                //keyboard.left = "10px";
                this.advancedTexture.addControl(keyboard);
        */
    }

    showPart2_2() {
        this.currentScreen = "part2_2";
        console.log("showPart2_2 currentSession.currAutoColor: " + currentSession.currAutoColor);
        if (currentSession.currAutoColor == "NO") {///קונה
            const initialText = this.text_part2_manualColor_2
            this.textField.text = initialText;///to take it out we need declare initialText before as variable
        } else {///מוכר
            const initialText = this.text_part2_autoColor_2
            this.textField.text = initialText;
        }


        this.showNextButton();///to init part 2
        this.showColorChooseButtons();

        this.nextButton.isEnabled = true;
        /*
                let inputTextArea = new BABYLON.GUI.InputText('time4Buy', "");
                inputTextArea.height = "40px";
                inputTextArea.color = "white";
                inputTextArea.fontSize = 48;
                inputTextArea.top = "-120px";
                inputTextArea.height = "70px";
                inputTextArea.width = "200px";
                inputTextArea.onTextChangedObservable.add(() => this.nextButton.isEnabled = true);
                this.advancedTexture.addControl(inputTextArea);
        
                const keyboard = new BABYLON.GUI.VirtualKeyboard("vkb");
                keyboard.addKeysRow(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "\u2190"]);
                keyboard.connect(inputTextArea);
                keyboard.top = "-10px";
                keyboard.scaleY = 2;
                keyboard.scaleX = 2;
                //keyboard.left = "10px";
                this.advancedTexture.addControl(keyboard);
        */
    }
    donePart2() {
        this.textField.text = "יש להמתין לתשובת בן הזוג"; ///will be ovrighten by server if needed
        let buyInputfield = this.advancedTexture.getControlByName("time4Buy");
        let buyTime = buyInputfield.text;
        console.log("part2 buyTime: " + buyTime);
        ////was curentSession = new ASession(id)...
        ///TODO: call curentSession to add answer (buyTime) to database 
        ///      curentSession will call the next stage when it will get trigger from database
        //////////////////////////currentSession.updateBuySellTime(buyTime);///comment in 12_9_25
        /* moved to showStartPart2
        this.advancedTexture.removeControl(buyInputfield);
        buyInputfield.dispose();
        let buyKeyboard = this.advancedTexture.getControlByName("vkb");
        this.advancedTexture.removeControl(buyKeyboard);
        buyKeyboard.dispose();
        */
        return buyTime;
    }



    showStartPart2(isDealdone, mySecondsOffered, pairSecondsOffered) { ///called when server  send "continue"
        let buyInputfield = this.advancedTexture.getControlByName("time4Buy");
        if (buyInputfield) {
            this.advancedTexture.removeControl(buyInputfield);
            buyInputfield.dispose();
        }
        let buyKeyboard = this.advancedTexture.getControlByName("vkb");
        if (buyKeyboard) {
            this.advancedTexture.removeControl(buyKeyboard);
            buyKeyboard.dispose();
        }
        buyKeyboard.dispose();


        console.log("in showStartPart2. isDealdone= " + isDealdone + " startAutoColor: " + currentSession.startAutoColor);
        let theMessage;
        let timeAdded = Math.min(mySecondsOffered, pairSecondsOffered);
        console.log("mySecondsOffered: " + mySecondsOffered + "pairSecondsOffered: " + pairSecondsOffered + "timeAdded: " + timeAdded);
        if (isDealdone) {///מחליפים
            if (currentSession.startAutoColor == "Allowed to choose") {///היה מוכר
                theMessage = "העסקה התבצעה, ירדו לך " + "\n" +
                    "" + timeAdded + "" + "\n" +
                    "דקות מזמן המבחן לצורך חישוב הבונוס. " + "\n" +
                    "כעת ימשיכו 22 הצעדים הבאים" + "\n" +
                    "לחץ המשך כדי להתחיל"
                currentSession.currAutoColor = "NO";
            } else { ///היה קונה
                theMessage = "העסקה התבצעה, התווספו לך " + "\n" + timeAdded + "\n" +
                    "דקות לזמן המבחן לצורך חישוב הבונוס" + "\n" +
                    "כעת ימשיכו 22 הצעדים הבאים" + "\n" +
                    "לחץ המשך כדי להתחיל"
                currentSession.currAutoColor = "YES";
            }
        } else {///לא מחליפים
            theMessage = "העסקה לא התבצעה. כעת ימשיכו 22 הצעדים הבאים" + "\n" +
                "לחץ המשך כדי להתחיל"
        }
        this.textField.text = theMessage;
        this.nextButton.isEnabled = true;
        this.currentScreen = "startPart2";
    }

    showExamA() {
        this.nextButton.isEnabled = true;
        this.currentScreen = "examA";
        this.textField.text = "בשלב הבא יש לבנות מודל במינימום זמן" + "\n" + "מי שיסיים את הבנייה בשלב זה ובשלב" + "\n" + "הבא בזמן המהיר ביותר, יקבל בונוס" + "\n" + "נא לחצ/י המשך ואז הסתובב/י והתחל/י בבנייה"
    }

    showExamB() {
        this.nextButton.isEnabled = true;
        this.currentScreen = "examB";
        this.textField.text = "הגעת לשלב האחרון בו יש לבנות שני מודלים במינימום זמן" + "\n" + "מי שיסיים את הבנייה של השלב הזה והשלב" + "\n" + " הקודם בזמן הקצר ביותר יקבל בונוס" + "\n" + "נא לחצ/י המשך ואז הסתובב/י והתחל/י בבנייה"
    }

    showLastScreen() {
        //this.currentScreen.
        this.currentScreen = "lastScreen";
        this.textField.text = "תודה רבה. הורד את המשקפיים והחזר אותם לנסיין"
        this.nextButton.isEnabled = false;
        currentSession.endSession();
    }

    hide() {
        this.plane.isVisible = false;
    }

    handleAutoColorClick() {
        currentSession.currAutoColor = "YES";
        colorButtonsIsVisible(false);

        // get current model name and step
        let mName = currentModel.metadata.modelName;
        let nextStep = currentModel.metadata.numOfBlocks + 1;

        const nexstDataLine = currentSession.trainingModelData
            .filter(el => (el.step == nextStep) && (el.modelName == mName))[0];

        if (nexstDataLine) {
            let menuBlock = elementsMenu.getChildMeshes(false, node => node.name == nexstDataLine.type)[0];
            let newColor = colorName2Vector(nexstDataLine.color);
            menuBlock.material.diffuseColor = newColor;
        }

        this.hideColorChooseButtons();
        console.log("in handleAutoColorClick part: " + currentSession.part);
        console.log("cuurentScreen: " + this.currentScreen);
        if (this.currentScreen == "part2_2") {
            console.log("in handleAutoColorClick part: " + currentSession.part);
            console.log("cuurentScreen: " + this.currentScreen);
            this.textField.text = "לחץ המשך והתחל בבנייה"
            this.showNextButton();
            const initialData = {
                action: 'autoColorClick',
                userId: currentSession.userId,
                startAutoColor: currentSession.startAutoColor,
                secondColorState: "auto"
            };
            postDataFuncURL(coupleURL, initialData);
        } else {
            const initialData = {
                action: 'autoColorClick',
                userId: currentSession.userId,
                startAutoColor: currentSession.startAutoColor,
                firstColorState: "auto"
            };
            console.log(" initialData: " + initialData);
            console.log(" coupleURL: " + coupleURL);
            postDataFuncURL(coupleURL, initialData);
            this.textField.text = "ניתן להתחיל בבנייה"
        }
    }

    handleManualColorClick() {
        //console.log("in handleManualColorClick part: " + currentSession.part);
        currentSession.currAutoColor = "NO";
        colorButtonsIsVisible(true)
        this.hideColorChooseButtons();

        if (this.currentScreen == "part2_2") {
            console.log("in handleAutoColorClick part: " + currentSession.part);
            console.log("cuurentScreen: " + this.currentScreen);
            const initialData = {
                action: 'autoColorClick',
                userId: currentSession.userId,
                startAutoColor: currentSession.startAutoColor,
                secondColorState: "manual"
            };
            /// replaced WebSocket send with REST call
            postDataFuncURL(coupleURL, initialData);

            this.textField.text = "לחץ המשך והתחל בבנייה"
            this.showNextButton();
        } else {
            const initialData = {
                action: 'autoColorClick',
                userId: currentSession.userId,
                startAutoColor: currentSession.startAutoColor,
                firstColorState: "manual"
            };
            /// replaced WebSocket send with REST call
            postDataFuncURL(coupleURL, initialData);

            this.textField.text = "ניתן להתחיל בבנייה"
        }
    }


}

class FbMessages {
    dynamicTexture;
    mat;
    plane;
    picPLane;
    advancedTexture4Pic = null;
    image;
    constructor(text, x = 0, y = 2.5, z = 2, pic = null) {
        ///Set font
        var font_size = 24;
        var font = "bold " + font_size + "px Arial";

        ///Set height for plane
        var planeHeight = 0.5;

        ///Set height for dynamic texture
        var DTHeight = 1.5 * font_size; //or set as wished

        ///Calcultae ratio
        var ratio = planeHeight / DTHeight;

        ///Use a temporay dynamic texture to calculate the length of the text on the dynamic texture canvas
        var temp = new BABYLON.DynamicTexture("DynamicTexture", 64, scene);
        var tmpctx = temp.getContext();
        tmpctx.font = font;
        var DTWidth = tmpctx.measureText(text).width + 8;
        temp.dispose();
        ///Calculate width the plane has to be 
        var planeWidth = DTWidth * ratio;

        ///Create dynamic texture and write the text
        this.dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", { width: DTWidth, height: DTHeight }, scene, false);
        this.mat = new BABYLON.StandardMaterial("mat", scene);
        this.mat.diffuseTexture = this.dynamicTexture;
        this.dynamicTexture.drawText(text, null, null, font, "#000000", "#ffffff", true);

        ///Create plane and set dynamic texture as material
        this.plane = BABYLON.MeshBuilder.CreatePlane("plane", { width: planeWidth, height: planeHeight }, scene);
        this.plane.material = this.mat;
        this.plane.position.y = y;
        this.plane.position.z = z;
        this.plane.position.x = x;
        this.plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;

        ///create plane for pic instructions
        if (pic) {
            let picHeight = 1.5;
            let picWidth = 1.5;
            this.picPLane = BABYLON.MeshBuilder.CreatePlane("plane", { width: picWidth, height: picHeight }, scene);
            this.picPLane.material = this.mat;
            this.picPLane.position.y = y + picHeight / 2 + planeHeight / 2;
            this.picPLane.position.z = z;
            this.picPLane.position.x = x;
            this.picPLane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
            this.advancedTexture4Pic = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this.picPLane);

            this.image = new BABYLON.GUI.Image("but");
            this.image.source = pic;//"textures/pink_py.png";
            this.advancedTexture4Pic.addControl(this.image);

            this.advancedTexture4Pic.background = 'green';
        }
    }

    setY(newY) {
        this.plane.position.y = newY;
    }

    hide() {
        this.plane.isVisible = false;
    }
    show() {
        this.plane.isVisible = true;
    }
    dispose() {
        this.dynamicTexture.dispose();
        this.mat.dispose();
        this.plane.dispose();
        if (this.picPLane) {
            this.picPLane.dispose();
        }
        if (this.advancedTexture4Pic) {
            this.advancedTexture4Pic.dispose();
        }

    }
}

class Timer {
    dynamicTexture;
    textureSize;
    mat;
    plane;
    currTime = 0;
    constructor(x = 1.5, y = 3.5, z = 2) {
        const text = '00:00 ';
        ///Set font
        var font_size = 24;
        this.font = "bold " + font_size + "px Arial";

        ///Set height for plane
        var planeHeight = 0.5;

        ///Set height for dynamic texture
        var DTHeight = 1.5 * font_size; //or set as wished

        ///Calcultae ratio
        var ratio = planeHeight / DTHeight;

        ///Use a temporay dynamic texture to calculate the length of the text on the dynamic texture canvas
        var temp = new BABYLON.DynamicTexture("DynamicTexture", 64, scene);
        var tmpctx = temp.getContext();
        tmpctx.font = this.font;
        var DTWidth = tmpctx.measureText(text).width + 8;
        temp.dispose();
        ///Calculate width the plane has to be 
        var planeWidth = DTWidth * ratio;

        ///Create dynamic texture and write the text
        this.dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", { width: DTWidth, height: DTHeight }, scene, false);
        this.mat = new BABYLON.StandardMaterial("mat", scene);
        this.mat.diffuseTexture = this.dynamicTexture;
        this.dynamicTexture.drawText(text, null, null, this.font, "#000000", "#ffffff", true);

        ///Create plane and set dynamic texture as material
        this.plane = BABYLON.MeshBuilder.CreatePlane("plane", { width: planeWidth, height: planeHeight }, scene);
        this.plane.material = this.mat;
        this.plane.position.y = y;
        this.plane.position.z = z;
        this.plane.position.x = x;
        this.plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
        this.textureSize = this.dynamicTexture.getSize();
        this.hide();
    }

    startTimer() {
        this.firstTime = new Date();
        this.lastTime = this.firstTime;
        this.timerInterval = setInterval(this.updateTimeGap.bind(this), 1000);
        this.show();
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }

    ///interval run in differend speed on different devices so we need to calculate the time gap
    updateTimeGap() {
        this.currTime = new Date();
        this.currGap = Math.floor((this.currTime - this.lastTime) / 1000);
        if (this.currGap > 0) {
            let timeToShow = Math.floor((this.currTime - this.firstTime) / 1000);
            this.lastTime = this.currTime;
            //this.currGap = this
            let newText = this.secToTimeString(timeToShow);
            const ctx = this.dynamicTexture.getContext();
            ctx.clearRect(0, 0, this.textureSize.width, this.textureSize.height);
            this.dynamicTexture.drawText(newText, null, null, this.font, "#000000", "#ffffff", true);
            this.dynamicTexture.update();
        }
    }

    secToTimeString(sec) {
        const minutes = Math.floor(sec / 60);
        const remainingSeconds = sec % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    setY(newY) {
        this.plane.position.y = newY;
    }

    hide() {
        this.plane.isVisible = false;
    }
    show() {
        this.plane.isVisible = true;
    }
    dispose() {
        this.dynamicTexture.dispose();
        this.mat.dispose();
        this.plane.dispose();

    }
}
