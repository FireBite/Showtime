var timerImmediate;
var config;

class State {
    constructor(cfg) {
        config = cfg;

        this.configRevision = 0;

        this.totalTime = 60;

        this.state = "idle";
        this.isTimerActive = false;
        this.ringBell = false;
        this.bellMode = 0;
        this.switchMode = 0;
        
        this.speaker = "";
        this.customText = "";
        this.candidates = ["A", "B", "C"];
        this.timeLeft = this.totalTime;

        this.connections = 0;
    }

    changeState(state) {
        if (state === "idle") {
            this.resetTimer();
        } else if (state === "countdown") {

        } else {
            console.error("[State] StateChange: Invalid state (" + this.state + ")");
            return false;
        }

        this.state = state;
        return true;
    }

    modifyTime(amount) {
        if (!this.isTimerActive) {
            console.warn("[State] ModifyTime: Timer not running");
            return false;
        }

        if (this.timeLeft + amount > 0) {
            this.timeLeft += amount;
            return true;
        } else {
            console.warn("[State] ModifyTime: Change would result in negative time, ignoring");
            return false;
        }
    }

    startTimer() {
        if (this.isTimerActive) {
            console.warn("[State] Timer: Timer already running");
            return false;
        }

        if (this.state === "idle") {
            console.warn("[State] Timer: Current state is idle, ignoring");
            return false;
        }

        console.log("[State] Timer: Started (" + this.timeLeft + ")");
        timerImmediate = setInterval(() => {
            if (this.timeLeft === 0) {
                clearInterval(timerImmediate);
                console.log("[State] Timer: Elapsed");
                this.isTimerActive = false;

                if(this.bell_mode === 0){
                    this.ringBell = true;
                }
            } else {
                this.timeLeft--;
            }
        }, 1000);

        this.isTimerActive = true;
    }

    pauseTimer() {
        if (!this.isTimerActive) {
            console.warn("[State] Timer: Timer not running");
            return false;
        }
        clearInterval(timerImmediate);
        console.log("[State] Timer: Paused");

        this.isTimerActive = false;
    }

    resetTimer() {
        if (this.isTimerActive) {
            this.pauseTimer();
        }
        this.timeLeft = this.totalTime;
    }
}

module.exports = State;