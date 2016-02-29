$(document).ready(function() {
  chatList.init();
});

var templates = {
  postTempl: [
    "<li id='<%= _id %>'>",
     "<h3><%= username %></h3>",
     "<span><%= timestamp %></span></br>",
     "<p><%= text %></p>",
     "<i class='fa fa-times-circle deleteBox' data-postid='<%= _id %>'></i>",
    "</li>"].join("")
};

var chatList = {
  url: 'http://tiny-tiny.herokuapp.com/collections/hollabak',
  userListUrl: 'http://tiny-tiny.herokuapp.com/collections/hollabakUsers',

  init: function() {
    chatList.events();
    chatList.styling();
  },

  styling: function() {
    chatList.getPostsFromServer();
    chatList.getUsersFromServer();
    if(localStorage.getItem('username')) {
      chatList.setWelcomeMsg();
      $('#loginPage').removeClass('visible');
      $('#chatPage').addClass('visible');
    }
  },

  events: function() {
    chatList.updatePosts();
    $('#usernameInput').on('submit', function(event) {
      event.preventDefault();
      var newUser = chatList.createNewLogin(chatList.getUsername());
      chatList.setWelcomeMsg();
      $parentSection = $(this).parent('section');
      $parentSection.removeClass('visible');
      $parentSection.next('section').addClass('visible');
      chatList.addUserToList(newUser);
    });
    $('#newPostInput').on('submit', function(event) {
      event.preventDefault();
      console.log("submitted");
      var newPostObj = chatList.getNewPost();
      chatList.addPostToServer(newPostObj);
      chatList.getPostsFromServer();
    });
    $('#chatPage').on('click', '.deleteBox', function(event) {
      event.preventDefault();
      var user = $(this).siblings('h3').html();
      if (user === localStorage.getItem('username')) {
        var postId = $(this).data('postid');
        chatList.deletePost(postId);
      }
    });
    $('button.logout').on('click', function(event) {
      event.preventDefault();
      chatList.removeUserFromList(localStorage.getItem('username'));
      $('#loginPage').addClass('visible');
      $('#chatPage').removeClass('visible');
    });
  },

  createNewLogin: function(username) {
    var loginTime = new Date();
    var loginString = loginTime.toLocaleTimeString();
    return {
      username: username,
      login_time: loginString,
    };
  },

  getUsername: function() {
    var username = $('input[name="username"]').val();
    $('input[name="username"]').val("");
    localStorage.setItem('username', username);
    return username;
  },

  addUserToList: function(user) {
    $.ajax({
      url: chatList.userListUrl,
      method: 'POST',
      data: user,
      success: function(response) {
        console.log(chatList.userList);
      },
    });
  },

  deleteUser: function(userId) {
    $.ajax({
      url: chatList.userListUrl + '/' + userId,
      method: 'DELETE',
      success: function(response) {
        console.log("successfully deleted");
      },
    });
  },

  getUsersFromServer: function() {
    $.ajax({
      url: chatList.userListUrl,
      method: 'GET',
      success: function(userList) {
        console.log(userList);
        chatList.addAllUsersToDom(userList);
      },
      error: function(err) {
        console.log("ERROR", err);
      },
    });
  },

  addAllUsersToDom: function(userList) {
    $('aside').find('ul').html('');
    _.each(userList, function(user) {
        $('aside').find('ul').append("<li>" + user.username + "</li>");
    });
  },

  setWelcomeMsg: function() {
    $('#welcomeMsg').html("Hello, " + localStorage.getItem('username') + "!");
  },

  getNewPost: function() {
    var newPostText = $('input[name="newPost"]').val();
    $('input[name="newPost"]').val("");
    var newPostTime = new Date();
    var timeStamp = newPostTime.toLocaleTimeString();
    return {
      username: localStorage.getItem('username'),
      text: newPostText,
      timestamp: timeStamp,
    };
  },

  addPostToServer: function(newPostObj) {
    $.ajax({
      url: chatList.url,
      method: 'POST',
      data: newPostObj,
      success: function(response) {
        console.log(newPostObj);
      },
      error: function(err) {
        console.log("ERROR", err);
      },
    });
  },

  getPostsFromServer: function() {
    $.ajax({
      url: chatList.url,
      method: 'GET',
      success: function(chatPosts) {
        chatList.addAllPostsToDom(chatPosts);
      },
      error: function(err) {
        console.log("ERROR", err);
      },
    });
  },

  addAllPostsToDom: function(chatPostsArr) {
    $('#chatPosts').html('');
    _.each(chatPostsArr, function(item) {
        $('#chatPosts').prepend(chatList.createPostStr(item));
    });
  },

  updatePosts: function() {
    window.setInterval(function(){chatList.getPostsFromServer()}, 2000);
    window.setInterval(function(){chatList.getUsersFromServer()}, 2000);
  },

  createPostStr: function(newPost) {
      var postTempl = _.template(templates.postTempl);
      return postTempl(newPost);
  },

  deletePost: function(postId) {
    $.ajax({
      url: chatList.url + '/' + postId,
      method: 'DELETE',
      success: function(response) {
        chatList.getPostsFromServer();
      }
    });
  },

  removeUserFromList: function(username) {
    $.ajax({
      url: chatList.userListUrl,
      method: 'GET',
      success: function(userList) {
        var filteredUserArr = _.filter(userList, function(user) {
          return user.username === username;
        });
        var selectedUser = filteredUserArr[0];
        chatList.deleteUser(selectedUser._id);
      },
      error: function(err) {
        console.log("ERROR", err);
      },
    });
  },

  clearUsersFromList: function() {
    $.ajax({
      url: chatList.userListUrl,
      method: 'GET',
      success: function(userList) {
        _.each(userList, function(user) {
          $.ajax({
            url: chatList.userListUrl + '/' + user._id,
            method: 'DELETE',
            success: function(response) {
              chatList.getUsersFromServer();
            }
          });
        });
      },
      error: function(err) {
        console.log("ERROR", err);
      },
    });
  },
};
