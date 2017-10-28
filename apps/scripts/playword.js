(function() {
    'use strict';

    class PlayWord {
        constructor() {
            this.synth = null;
            this.noteMap = {
                '0': 84, '1': 82,	 '2': 36, '3': 23, '4': 71,
	              '5': 59, '6': 28, '7': 105, '8': 83, '9': 119,
	              q: 40, w: 33, e: 60, r: 69, t: 67, y: 48, u: 65, i: 55,
	              o: 84, p: 96,
                a: 64, s: 67, d: 62, f: 50, g: 69, h: 65, j: 43, k: 88, l: 77,
                z: 103, x: 101, c: 52, v: 86, b: 33,
	              n: 76, m: 62,
                '.': 69, ',': 68, '?': 105
            };
            this.bpm = 120;
            this.bpmillis = 0;
            this.seqNo = null;
            this.midiOut = null;
        }
        init (synth) {
            this.synth = synth;
        }
        setbpm (bpm) {
            this.bpm = bpm;
            this.bpm2msec();
        }
        bpm2msec () {
            this.bpmillis = 60000 / this.bpm;
        }
        getNoteno (word) {
            return this.noteMap[word];
        }
        setMIDIOutdevice (obj) {
            this.midiOut = obj;
        }
        sendProgramChange (ch, no) {
            let self = this;
            setTimeout(() => {
                let s = "0xc"+ch.toString(16, 10);
                let prgNo = '0x'+('0000'+no.toString(16,10)).substr(-2);
                if(self.midiOut !== null) self.midiOut.sendRawMessage([s, prgNo]);
            }, 500);

        }
        text2seq (word) {
            if(this.bpmillis==0) this.bpm2msec(); 
            let outSeq = [];
            for(let i=0; i<word.length; i++) {
                let note = this.getNoteno(word.substr(i, 1).toLowerCase());
                let velocity = 100;
                if(typeof note == 'undefined') {
                    note = 60;
                    velocity = 0;
                }
                outSeq.push({
                    note: note,
                    velocity: velocity,
                    time: i * this.bpmillis
                });
            }
            return outSeq;
        }
        play (word) {
            let seq = this.text2seq(word);
            for(let i=0; i<seq.length; i++) {
                let midi = {noteOn: [0x91, seq[i].note, 100], noteOff:[0x81, seq[i].note, 100] };
                setTimeout(() => {
                    this.synth.send(midi.noteOn);
                    if(this.midiOut !== null) this.midiOut.sendRawMessage(midi.noteOn);
                }, seq[i].time);
                setTimeout(() => {
                    if(this.midiOut !== null) this.midiOut.sendRawMessage(midi.noteOff);
                    this.synth.send(midi.noteOff);
                }, seq[i].time + 5000);
            } 
            return {word: word, seq: seq};
        }
    }
    
    window.playword = new PlayWord();

})();
