var CalendarController = {
	events_url: "events.json",
	dataSource: {},
	contex: null,
	
	init: function(){
		var self = CalendarController;
		this.contex = $("#HM_CALENDAR");
		
		this.eventsDialog = $("#HM_EVENT_DIALOG");
		this.eventsDialog.dialog({
			width: 500,
			modal: true,
			dialogClass: "HM_DIALOG", 
			autoOpen: false,
			resizable: false,
			show: "puff",
			hide: "explode"
		});
		
		this.contex.datepicker({
			onChangeMonthYear: function (year, month, ins) {
				CalendarController.monthRotation(year, month);
			},
			
			onSelect: function(dateText, inst) {
				var date = dateText.match(/(\d{2}).(\d{2}).(\d{4})/);
				
				if (self.find_by_day(date[1]) != undefined) {
					var events = self.find_by_day(date[1]);
					var content = self.eventsDialog;
					content.dialog("option", "title", "Wydarzenia na "+dateText);
					content.empty();
					
					content.append("<ul class='HM_EVENTS'></ul>");
					var ul = content.find("ul");
					
					$.each(events, function () {
						var event = this;
						var li = $('<li></li>');
						
						var spanTime = $('<span class="date"></span>');
						spanTime.text("od " + event["start_time"] + " do " + event["end_time"]);
						
						li.append(spanTime);
						
						var a = $('<a></a>');
						a.attr("href", event["url"])
						 .text(event["name"]);
						li.append(a);
						
						ul.append(li);
					});
					
					self.eventsDialog.dialog("open");
				}
				
				setTimeout(CalendarController.rebuildCalendar, 10);
			}
			
		});
		
		var today = new Date();
		CalendarController.monthRotation(today.getFullYear(), today.getMonth() + 1);
	},
	
	monthRotation: function(year, month){
		var self = this;
		self.dataSource = {};
		$.getJSON(self.events_url + "?month="+year+"-"+month, function(data) {
		  self.buildDataSource(data);
			self.rebuildCalendar();
		});
	},
	
	find_by_day: function(day){
		return this.dataSource[parseInt(day)];
	},
	
	rebuildCalendar: function(){
		var self = CalendarController;
		self.contex.find("tbody tr td:not(.ui-datepicker-unselectable)").each(function () {
			var tdDate = parseInt($(this).text());
			
			if (self.find_by_day(tdDate) != undefined) {
				$(this).addClass("event");
			}
		});
	},
	
	buildDataSource: function(data){
		var self = this;
		self.dataSource = {};
		$.each(data, function () {
			var event = this;
			var date = event['date'].match(/(\d{4})-(\d{2})-(\d{2})/);
			var day = parseInt(date[3]);
			if (self.find_by_day(day) == undefined) {
				self.dataSource[day] = [];
			}
			self.dataSource[day].push(event);
		});
	},
}