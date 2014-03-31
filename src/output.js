module.exports = {

    print: function(object, repetitions)
    {
        var message;
        if (typeof object !== "string") {
            message = JSON.stringify(object, null, '\t');
        } else {
            message = object;
        }
        repetitions = repetitions || 1;
        for (var i = 0; i < repetitions; i++) {
            process.stdout.write(message);
        }
        process.stdout.write('\n');
    },

    printHeader: function (title) {
        var separator_length = title.length + 4;

        that.print("#", separator_length);
        that.print("# " + title + " #");
        that.print("#", separator_length);
    }
};

var that = module.exports;
