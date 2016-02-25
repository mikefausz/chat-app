$(document).ready(function() {
  chatList.init();
  // chatList.deletePost("");
});

var templates = {
  postTempl: [
    "<li id='<%= _id %>'>",
     "<p><%= timestamp %></p>",
     "<h3><%= username %></h3>",
      "<p><%= text %></p>",
      "<i class='fa fa-times-circle deleteBox' data-postid='<%= _id %>'></i>",
    "</li>"].join("")
};

var chatList = {
  url: 'http://tiny-tiny.herokuapp.com/collections/hollabak',
  userList: [],

  init: function() {
    chatList.events();
    chatList.styling();
  },

  styling: function() {
    chatList.getPostsFromServer();
  },

  events: function() {
    chatList.updatePosts();
    $('#usernameInput').on('submit', function(event) {
      event.preventDefault();
      var username = chatList.getUsername();
      chatList.setWelcomeMsg();
      $parentSection = $(this).parent('section');
      $parentSection.removeClass('visible');
      $parentSection.next('section').addClass('visible');
      chatList.addUserToList(username);
    });

    $('#newPostInput').on('submit', function(event) {
      event.preventDefault();
      var newPostObj = chatList.getNewPost();
      chatList.addPostToServer(newPostObj);
      chatList.getPostsFromServer();
    });
    $('#chatPage').on('click', '.deleteBox', function(event) {
      event.preventDefault();
      window.glob = $(this);
      var user = $(this).siblings('h3').html();
      if (user === localStorage.getItem('username')) {
        var postId = $(this).data('postid');
        chatList.deletePost(postId);
      };
    });
  },

  getUsername: function() {
    var username = $('input[name="username"]').val();
    $('input[name="newTodo"]').val("");
    localStorage.setItem('username', username);
    return username;
  },

  // addUserListToServer: function() {
  //   $.ajax({
  //     url: chatList.url,
  //     method: 'POST',
  //     data: chatList.userList,
  //     success: function(response) {
  //       console.log(chatList.userList);
  //     },
  //   });
  // },

  updateUserList: function() {
    $.ajax({
      url: chatList.url,
      method: 'PUT',
      data: chatList.userList,
      success: function(response) {
        console.log(chatList.userList);
      },
    });
  },

  addUserToList: function(username) {
    chatList.userList.push(username);
  },

  removeUserFromList: function(username) {

  },

  setWelcomeMsg: function() {
    $('#welcomeMsg').html("hollabak, " + localStorage.getItem('username') + " !");
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
        console.log(chatPosts);
        chatList.addAllPostsToDom(chatPosts);
      },
      error: function(err) {
        console.log("ERROR", err);
      },
    });
  },

  addAllPostsToDom: function(chatPostsArr) {
    $('#chatPage').find('ul').html('');
    _.each(chatPostsArr, function(item) {
      if (item.username) {
        $('#chatPage').find('ul').prepend(chatList.createPostStr(item));
      }
    });
  },

  updatePosts: function() {
    window.setInterval(function(){chatList.getPostsFromServer()}, 2000);
    // window.setInterval(function(){chatList.updateUserList()}, 2000);
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
  }
};
