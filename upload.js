/**
 * Created by psarode on 2/27/2015.
 */
var http = require("http");
var url = require("url");
var formidable = require('formidable');
var fs = require("fs");
var util = require('util');
var path = require('path');

var server = http.createServer(function(req, res) {
    // Simple path-based request dispatcher
    switch (url.parse(req.url).pathname) {
        case '/':
            display_form(req, res);
            break;
        case '/upload':
            upload_file(req, res);
            break;
        case '/download':
            download_file(req, res);
            break;
        default:
            show_404(req, res);
            break;
    }
});

// Server would listen on port 8000
server.listen(3000);

/*
 * Display upload form
 */
function display_form(req, res) {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write(
        '<form action="/upload" method="post" enctype="multipart/form-data">'+
        '<input type="file" name="upload-file">'+
        '<input type="submit" value="Upload">'+
        '</form>'
    );
    res.end();
}
/*
 * Handle file upload
 */

    function upload_file(response, request) {
        console.log("Request handler 'upload' was called.");
        var form = new formidable.IncomingForm();
        console.log("about to parse");
        var filename;
        form.uploadDir = path.join(__dirname, 'uploads');
        form.on('file', function(field, file) {
            //rename the incoming file to the file's name
            filename = file.name;
            fs.rename(file.path, form.uploadDir + "/" + file.name);
        })
            .on('error', function(err) {
                console.log("an error has occured with form upload");
                console.log(err);
                request.resume();
            })
            .on('aborted', function(err) {
                console.log("user aborted upload");
            })
            .on('end', function() {
                console.log('-> upload done');
            });

        form.parse(request, function(error, fields, files) {
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write("The File "+filename+" is uploaded successfully!!!");
            response.end();
        });
    }
/*
 * Handle file download
 */
function download_file(req, res) {
    var queryData = url.parse(req.url, true).query;
    filePath = path.resolve(__dirname, 'upload', queryData.fileName);
    console.log(' filePath download :'+ filePath);
    fs.exists(filePath, function (exists) {
        if (exists) {
            var stat = fs.statSync(filePath);
            res.writeHead(200, {
                'Content-Type': 'text/plain',
                'Content-Length': stat.size
            });
            var fileReadStream = fs.createReadStream(filePath, {encoding: 'utf8'});
            fileReadStream.pipe(res);
        }else{
            res.writeHead(404);
            res.write(filePath + " not found");
            res.end();
        }
    });

    return;
}
/*
 * Handles page not found error
 */
function show_404(req, res) {
    res.writeHead(404, {"Content-Type": "text/plain"});
    res.write("Incorrect URL!");
    res.end();
}