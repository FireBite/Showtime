class CommandParser {
    constructor(state, config) {
        this.state = state;
        this.config = config;
    }

    parse(json) {
        var response = new CommandResponse();
        try {
            var m = JSON.parse(json);

            var msg = m.msg;

            switch (msg) {
                case "fetch":
                    response.data = JSON.stringify(state);
                    break;

                case "config":
                    response.message = "config";

                    if (m.data != null) {
                        this.config = JSON.parse(m.data);

                        //Handle switch
                        this.state.configRevision++;
                        console.error("[CommandParser] Config: Revision update" + this.state.speaker);
                    }

                    response.data = JSON.stringify(this.config);
                    break;

                case "start":
                    this.state.startTimer();
                    break;

                case "pause":
                    this.state.pauseTimer();
                    break;

                case "stop":
                    this.state.resetTimer();
                    break;

                case "bell":
                    this.state.ringBell = true;
                    break;

                case "bell-rcv":
                    this.state.ringBell = false;
                    break;

                case "changeprop":
                    switch (m.prop) {
                        case "bell":
                            if (state.bell_mode === 0) {
                                state.bell_mode = 1;
                            } else {
                                state.bell_mode = 0;
                            }
                            break;
                        case "switch":
                            
                            break;
                        case "rnd":
                            break;
                        case "pictures":
                            break;
                    }
                    break;

                case "totaltime":
                    var number = Number(m.time);
                    if(number <= 0 || number % 1 !== 0){
                        console.error("[State] TotalTime: Invalid time (" + number + ")");
                        break;
                    }
                    this.state.totalTime = number;
                    if(this.state.state === "idle"){
                        this.state.timeLeft = this.state.totalTime;
                    }
                    break;

                case "modify":
                    if (!this.state.modifyTime(m.amount)) {
                        response.isError = true;
                        response.message = "invalidData";
                    }
                    break;

                case "candidate":
                    switch (m.candidate) {
                        case -1:
                            this.state.speaker = "";
                            break;
                        case 0:
                            this.state.speaker = this.state.customText;
                            break;
                        default:
                            this.state.speaker = this.config.candidate_list[m.candidate];
                            break;
                    }
                    break;

                case "customtext":
                    this.state.customText = m.text;
                    break;

                case "state":
                    if (!this.state.changeState(m.state)) {
                        response.isError = true;
                        response.message = "invalidData";
                    }
                    break;

                default:
                    console.error("[CommandParser] ParseException: Invalid message type (" + msg + ")");
                    break;
            }
        } catch (e) {
            console.error("[CommandParser] ParseException: " + e);
            response.isError = true;
            response.message = "parseError";
            response.data = e;
        }

        return JSON.stringify(response);
    }
}

class CommandResponse {
    constructor() {
        this.message = "ok";
        this.isError = false;
        this.data = "";
    }
}

module.exports = CommandParser;