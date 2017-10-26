const Playword = function(synth) {
    this.synth = synth;
    this.noteMap = {
        '0': 84, '1': 82,	 '2': 36, '3': 23, '4': 71,
	      '5': 59, '6': 28, '7': 105, '8': 83, '9': 119, '0': 96,
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
};

Playword.prototype = {
    setbpm: function(bpm) {
        this.bpm = bpm;
        this.bpm2msec();
    },
    bpm2msec: function() {
        this.bpmillis = 60000 / this.bpm;
    },
    getNoteno: function(word) {
        return this.noteMap[word];
    },
    text2seq: function(word) {
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
    },
    play: function(word) {
        let seq = this.text2seq(word);
        
        for(let i=0; i<seq.length; i++) {
            setTimeout(() => {
             this.synth.send([0x90, seq[i].note, 100]);
            }, seq[i].time);
/*
            setTimeout(() => {
                this.synth.send([0x80, seq[i].note, 0]);
            }, seq[i].time + 5000);
*/
        } 

    }
};

