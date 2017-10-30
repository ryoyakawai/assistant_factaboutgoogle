// https://two.js.org/examples/text.html     
let type = 'canvas';
let two = new Two({
    type: Two.Types[type],
    fullscreen: true,
    autostart: true
}).appendTo(document.querySelector('#textcanvas'));

let characters = [];
let gravity = new Two.Vector(0, 0.66);

let styles = {
    family: 'proxima-nova, sans-serif',
    size: 50,
    leading: 50,
    weight: 900
};

let directions = two.makeText('Sound Maker', two.width / 2, two.height / 2, styles);
directions.fill = '#fefeef';

document.addEventListener('keydown', (e) => {
    let character = String.fromCharCode(e.which);
    add(character);
    tinyPlay(character);
    runCandlebulb(character);
});
document.addEventListener('touchstart', (e) => {
    let r = Math.random();
    let character = String.fromCharCode(Math.floor(r*26) + (r>0.5?97:65));
    add(character);
    tinyPlay(character);
    runCandlebulb(character);
});

two.bind('resize', function() {
    directions.translation.set(two.width / 2, two.height / 2);
}).bind('update', function() {
    for (let i = 0; i < characters.length; i++) {
        
        let text = characters[i];
        text.translation.addSelf(text.velocity);
        text.rotation += text.velocity.r;
        
        text.velocity.addSelf(gravity);
        if (text.velocity.y > 0 && text.translation.y > two.height)  {
            two.scene.remove(text);
            characters.splice(i, 1);
        }
        
    }

});

function add(msg, turn) {
    let x = Math.random() * two.width / 2 + two.width / 4;
    let y = two.height * 1.25;
    
    let text = two.makeText(msg, x, y, styles);
    text.size *= 2;
    text.fill = '#333';
    
    text.velocity = new Two.Vector();
    text.velocity.x = 10 * (Math.random() - 0.5);
    text.velocity.y = - (( 20 * Math.random() +20 % two.height ));
    text.velocity.r = Math.random() * Math.PI / 8;

    if(turn===false) {
        text.velocity.x = 1;
        text.velocity.y = -35;
        text.velocity.r = 0.000001;
    }
    characters.push(text);
}
