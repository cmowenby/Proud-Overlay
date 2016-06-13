window.fbAsyncInit = function() {
    FB.init({
      appId      : '198571833849833',
      xfbml      : true,
      version    : 'v2.5'
    });
};

var response;
var webUrl;
var first;
var last;

(function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "http://connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function upload() {
    var comment = $("#comment").text;
    
}

function loginCallback(response) {
    this.response = response;
    
    if (!response.error && response.authResponse) {
        console.log("Authorized :)");
        
        FB.api('/me', function(response) {
            if (response && !response.error) {
                var name = response.name;
                name = name.split(" ");
                first = name[0];
                last = name[1];
            }
        });
        
        var profilePic = new Image();
        profilePic.setAttribute('crossOrigin', 'anonymous');
        
        profilePic.src = "http://graph.facebook.com/" + response.authResponse.userID + "/picture?type=square&width=1000&height=1000";
        
        profilePic.onload = function() {
            canvas = document.createElement("canvas");
            canvas.width = 1000;
            canvas.height = 1000;
            var context = canvas.getContext("2d");
            context.drawImage(profilePic, 0, 0, profilePic.width, profilePic.height, 0, 0, canvas.width, canvas.height);
            var overlay = new Image();
            overlay.src = $("input[type='radio'][name='pride']:checked").val();
            overlay.onload = function() {
                context.drawImage(overlay, 0, 0);
                var newProfPic = canvas.toDataURL();
                
                $.ajax({
                    type: "POST",
                    url: "overlay-upload.php",
                    data: {
                        "img": newProfPic
                    },
                    success: function(url) {
                        webUrl = "http://proud.cubintraining.com/" + url;
                        $("#profile-pic").load(function() {
                            $("#upload-button").prop("disabled", false);
                            $("#loading").attr("hidden", true);
                            $("#pic-holder").attr("hidden", false);
                            $("#comment-holder").attr("hidden", false);
                        });
                        $("#profile-pic").attr("src", webUrl);
                    }
                });
            }
        }
    } else {
        $("#loading").attr("hidden", true);
        $("#not-authorized").attr("hidden", false);
    }
}

function upload() {
    if (webUrl !== undefined) {
        FB.api(
        "/me/photos",
        "POST",
        {
            "url": webUrl,
            "caption": $("#comment").val()
        },
        function (photo_response) {
            console.log(photo_response);
            if (photo_response && !photo_response.error) {
                if (photo_response.id) {
                    window.location.href = "https://www.facebook.com/photo.php?fbid=" + photo_response.id + "&makeprofile=1&profile_id=" + response.authResponse.userID;
                }
            }
            
            var fileNameBegin = webUrl.lastIndexOf('/') + 1;
            var fileNameEnd = webUrl.lastIndexOf('.png');
            var fileName = webUrl.substring(fileNameBegin, fileNameEnd);

            $.ajax({
                type: 'POST',
                url: 'overlay-delete.php',
                data: {
                    "img": fileName
                }
            });
        });   
    }
}

function login(){
    $("#loading").attr("hidden", false);
    $("#not-authorized").attr("hidden", true);
    $("#pic-holder").attr("hidden", true);
    $("#comment-holder").attr("hidden", true);
    $("#upload").attr("disabled", true);
    FB.login(loginCallback, {scope: "public_profile,user_photos,publish_actions"});
}