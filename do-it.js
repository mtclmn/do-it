// simple-todos.js

Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  // This code only runs on the client

  	Meteor.subscribe("tasks");

  	// BODY HELPERS

	Template.body.helpers({

		  tasks: function () {
		    if (Session.get("hideCompleted")) {
		      // If hide completed is checked, filter tasks
		      return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
		    } else {
		      // Otherwise, return all of the tasks
		      return Tasks.find({}, {sort: {createdAt: -1}});
		    }
		  },
		  hideCompleted: function () {
		    return Session.get("hideCompleted");
		  },
		  incompleteCount: function () {
		  return Tasks.find({checked: {$ne: true}}).count();
		  }

	});

  	// BODY EVENTS

	Template.body.events({

		"change .hide-completed input": function (event) {
			Session.set("hideCompleted", event.target.checked);
			},

		  "submit .new-task": function (event) {
		    // This function is called when the new task form is submitted

		    var text = event.target.text.value;

			Meteor.call("addTask", text);

		    // Clear form
		    event.target.text.value = "";

		    // Refocus form
		    event.target.focus;

		    // Prevent default form submit
		    return false;
		  }
	});

	// TASK EVENTS

	Template.task.events({

	  "click .toggle-checked": function () {
	    // Set the checked property to the opposite of its current value
	    Meteor.call("setChecked", this._id, ! this.checked);
	  },

	  "click .delete": function () {
	    Meteor.call("deleteTask", this._id);
	  }
	});

	// ADD ACCOUNTS

	Accounts.ui.config({
	  passwordSignupFields: "USERNAME_ONLY"
	});

} // END isCLIENT

Meteor.methods({
  addTask: function (text) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
    Tasks.update(taskId, { $set: { checked: setChecked} });
  }
});

// IF IS SERVER

if (Meteor.isServer) {
  Meteor.publish("tasks", function () {
    return Tasks.find();
  });
}