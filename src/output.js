var output = {
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

    printHeader: function (title)
    {
        var separator_length = title.length + 4;

        output.print("#", separator_length);
        output.print("# " + title + " #");
        output.print("#", separator_length);
    }
};

module.exports = output;
