//GLOBAL

var marker;
var app;

function initMap() {
	var map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 42.75, lng: 25.44},
		zoom: 5,
		restriction: {
			latLngBounds: {
				north: 45,
				south: 40,
				west: 21,
				east: 29
			}
		}
	});

	var options = {
		componentRestrictions: {country: "bg"}
	};
	var input = document.getElementById('address');
	var autocomplete = new google.maps.places.Autocomplete(input, options);
	var geocoder = new google.maps.Geocoder;
	var infowindow = new google.maps.InfoWindow;

	marker = new google.maps.Marker({
		map: map,
		anchorPoint: new google.maps.Point(0, -29),
		draggable: true,
		infowindow: infowindow,
	});

	google.maps.event.addListener(autocomplete, 'place_changed', function() {
		var place = autocomplete.getPlace();
		marker.setPosition(place.geometry.location);
		marker.setVisible(true);
		map.setCenter(marker.getPosition());
		app.contact.address = place.formatted_address;
		map.setZoom(15);
		infowindow.setContent(place.formatted_address);
		infowindow.open(map, marker);
	});

	map.addListener('click', function(event) {
		marker.setPosition(event.latLng);
		geocodeLatLng(geocoder,map,infowindow,marker.getPosition());
	});

	marker.addListener('dragend', function() {
		geocodeLatLng(geocoder, map, infowindow, this.getPosition());
	});
}

function geocodeLatLng(geocoder, map, infowindow, input) {
	var latlng = {lat: parseFloat(input.lat()), lng: parseFloat(input.lng())};

	geocoder.geocode({'location': latlng}, function(results, status) {
		if (status === 'OK') {
			if (results[0] && results[results.length-1].formatted_address == 'Bulgaria') {
				map.setZoom(15);
				marker.setPosition(latlng);
				marker.setVisible(true);
				app.contact.address = results[0].formatted_address;
				infowindow.setContent(results[0].formatted_address);
				infowindow.open(map, marker);
			}
		}
	});
}

$(document).ready(function () {
	app = new Vue({
		el: '#main',
		data: function () {
			return {
				errors: [],
				isHidden: true,
				isBeingEdited: false,
				indexOfEditing:'',
				contacts: [],
				contact:{
					firstName: '',
					lastName: '',
					address: '',
					phoneNumber: '',
					email: '',
				}
			}
		},
		methods: {
			checkForm: function (event) {
				event.preventDefault();

				this.errors = [];
				if (!this.contact.firstName) {
					this.errors.push("Please Fill Your First Name.");
				}
				if (!this.contact.lastName) {
					this.errors.push("Please Fill Your Last Name.");
				}
				if(!this.contact.address) {
					this.errors.push("Please Fill Your Address");
				}
				if(!this.contact.phoneNumber) {
					this.errors.push("Please Fill Your Phone Number");
				} else if(!this.validPhone(this.contact.phoneNumber)) {
					this.errors.push('Valid Phone Number required');
				}
				if (!this.contact.email) {
					this.errors.push('Email required.');
				} else if (!this.validEmail(this.contact.email)) {
					this.errors.push('Valid email required.');
				}

				if (!this.errors.length) {
					if (this.isBeingEdited) {
						this.contacts[this.indexOfEditing] = this.contact;
						this.isBeingEdited = false;
						this.indexOfEditing = '';
					} else {
						this.contacts.push(this.contact);
						this.isHidden = false;
						$('.table').removeClass('hidden');
						$('#edit').removeClass('hidden');
						$('#remove').removeClass('hidden');
					}
					this.resetForm();
					marker.infowindow.close();
					marker.setVisible(false);
					return true;
				}
				event.stopPropagation();
			},
			validEmail: function (email) {
				var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				return re.test(email);
			},
			validPhone: function (phoneNumber) {
				console.log(phoneNumber);
				var phoneRegEx = /\d{2,10}$/;
				if (phoneNumber.match(phoneRegEx)) {
					return true;
				} else {
					return false;
				}
			},
			selectContact: function (event) {
				var $this = $(event.target);
				var $selected = $this.closest('tr')
				if (!this.isBeingEdited) {
					$selected.toggleClass('selected')
					$selected.siblings().removeClass('selected');
				}
				//**************************************************
				// Future edit on select ???;
				//	if (!$this.closest('tr').hasClass('selected')) {
				//		this.isBeingEdited = false;
				//		this.indexOfEditing = '';
				//		this.resetForm();
				//	}
				//**************************************************
			},
			editContact: function (event) {
				var selectedIndex = parseInt($('.selected >td:first').text());
				if (selectedIndex.length === 0) {
					this.isBeingEdited = false;
					this.indexOfEditing = '';
					this.resetForm();
					return false;
				}

				this.contact = {...this.contacts[selectedIndex]};
				this.isBeingEdited = true;
				this.indexOfEditing = selectedIndex;
			},
			removeContact: function (event) {
				var selectedIndex = $('.selected > td:first').text();
				console.log(selectedIndex);
				if (selectedIndex.length === 0) {
					return false;
				}
				var confirmDelete = confirm('Are you sure you want to delete the selected item');

				if (!confirmDelete) {
					return false;
				} else {
					this.contacts.splice(selectedIndex,1);

					if(this.contacts.length === 0) {
						$('.table').addClass('hidden');
						$('#edit').addClass('hidden');
						$('#remove').addClass('hidden');
					}
				}
			},
			resetForm: function () {
				this.contact = {
					firstName: '',
					lastName: '',
					address: '',
					phoneNumber: '',
					email: '',
				}
			},
		}
	});
});
