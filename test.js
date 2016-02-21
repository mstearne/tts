var prompt = require("prompt");

prompt.start();

var life = {
    hungry: 'yes',
    keepPrompting: function() {
        prompt.get(["hungry"], function(err, result) {
            this.hungry = result.hungry;

            if(this.hungry==="yes") {
                console.log("Here are some more pizza burgers");
                life.keepPrompting();
            }else{
                console.log("You're full");
            }
        })
    }
}

life.keepPrompting();
