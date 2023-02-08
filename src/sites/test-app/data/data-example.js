// import UtilsNew from "../../../core/utils-new";
import {html} from "lit";


const defaultHighchartConfig = {
    chart: {
        backgroundColor: {
            // linearGradient: [0, 0, 500, 500],
            stops: [
                [0, "rgb(255, 255, 255)"],
                [1, "rgb(240, 240, 255)"]
            ]
        },
        borderWidth: 0,
        // plotBackgroundColor: "rgba(255, 255, 255, .9)",
        plotShadow: true,
        plotBorderWidth: 1
    },
    tooltip: {
        headerFormat: "<span style=\"font-size:10px\">{point.key}</span><table>",
        pointFormat: "<tr><td style=\"color:{series.color};padding:0\">{series.name}: </td>" +
            "<td style=\"padding:0\"><b>{point.y:.1f} </b></td></tr>",
        footerFormat: "</table>",
        shared: true,
        useHTML: true
    }
};

export const SAMPLE_DATA = {
    // inputComplex: "test template",
    inputTextFilled: "FieldWithText",
    inputDescFilled: "Lorem ipsum dolor sit amet, consectetur adipiscing elit esse cillum dolore magna aliquet",
    inputNumFilled: 4,
    inputDateFilled: "20210527101417",
    inputSelected: "Option 2",
    inputCheckBoxTrue: true,
    inputToggleSwitchOn: "on",
    inputToggleButtonsSelected: "YES",
    inputTextVal: "",
    testComplex: "test1",
    inputComplex: "test complex",
    inputJsonEditor: {
        "id": "0001",
        "type": "donut",
        "name": "Cake",
        "ppu": 0.55,
        "batters":
            {
                "batter":
                    [
                        {"id": "1001", "type": "Regular"},
                        {"id": "1002", "type": "Chocolate"},
                        {"id": "1003", "type": "Blueberry"},
                        {"id": "1004", "type": "Devil's Food"}
                    ]
            },
        "topping":
            [
                {"id": "5001", "type": "None"},
                {"id": "5002", "type": "Glazed"},
                {"id": "5005", "type": "Sugar"},
                {"id": "5007", "type": "Powdered Sugar"},
                {"id": "5006", "type": "Chocolate with Sprinkles"},
                {"id": "5003", "type": "Chocolate"},
                {"id": "5004", "type": "Maple"}
            ]
    },
    inputList: [
        {id: "1", name: "Pheno1_name"},
        {id: "2", name: "Pheno2_name"},
        {id: "3", name: "Pheno3_name"}
    ],
    inputTable: [
        {inputColumn1: "1", inputColumn2: "example text column1", inputColumn3: "No"},
        {inputColumn1: "2", inputColumn2: "example text column2", inputColumn3: "Yes"},
        {inputColumn1: "3", inputColumn2: "example text column3", inputColumn3: "No"},
    ],
    inputChart: {
        "1": 407221,
        "2": 397710,
        "3": 325355,
        "4": 345683,
        "5": 293194,
        "6": 289233,
        "7": 273441,
        "8": 245699,
        "9": 221785,
        "10": 242796,
        "11": 233551,
        "12": 224104,
        "13": 194918,
        "14": 148330,
        "15": 139955,
        "16": 148254,
        "17": 138759,
        "18": 140826,
        "19": 112977,
        "20": 121098,
        "21": 84033,
        "22": 78068,
    },
    inputPlotArray: [
        {id: "1", total: 423},
        {id: "2", total: 2234},
        {id: "3", total: 2346},
        {id: "4", total: 64564},
    ]

};

