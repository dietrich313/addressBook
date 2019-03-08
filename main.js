$(document).ready(function () {
	var marker;

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
					marker.setPosition(latlng);
					marker.setVisible(true);
					app.contact.address = results[0].formatted_address;
					infowindow.setContent(results[0].formatted_address);
					infowindow.open(map, marker);
				}
			}
		});
	}

	var app = new Vue({
		el: '#main',
		data: function () {
			return {
				errors: {},
				isHidden: true,
				isBeingEdited: false,
				indexOfEditing:null,
				selectedIndex:null,
				contacts: [],
				contact: {
					firstName: '',
					lastName: '',
					address: '',
					phoneNumber: '',
					email: '',
				}
			}
		},

		mounted: function () {
			initMap();
		},
		methods: {
			checkForm: function (event) {
				this.errors = {};
				if (!this.contact.firstName) {
					this.errors['firstName'] = "Please Fill Your First Name.";
				}
				if (!this.contact.lastName) {
					this.errors['lastName'] = "Please Fill Your Last Name.";
				}
				if(!this.contact.address) {
					this.errors['address'] = "Please Fill Your Address";
				}
				if(!this.contact.phoneNumber) {
					this.errors['phoneNumber'] = "Please Fill Your Phone Number";
				} else if(!this.validPhone(this.contact.phoneNumber)) {
					this.errors['phoneNumber'] = 'Valid Phone Number required';
				}
				if (!this.contact.email) {
					this.errors['email'] = 'Email required.';
				} else if (!this.validEmail(this.contact.email)) {
					this.errors['email'] = 'Valid email required.';
				}

				if (!this.getObjectLength(this.errors)) {
					if (this.isBeingEdited) {
						this.contacts[this.indexOfEditing] = this.contact;
						this.isBeingEdited = false;
						this.indexOfEditing = '';
					} else {
						this.contacts.push(this.contact);
						this.isHidden = false;
					}
					this.resetForm();
					marker.infowindow.close();
					marker.setVisible(false);
					return true;
				}
			},
			validEmail: function (email) {
				var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				return re.test(email);
			},

			checkPhoneNumber: function(value) {
				if (!value) {
					this.errors['phoneNumber'] = 'Please fill your Phone Number';
				}
				else if (!validPhone(value)){
					this.errors['phoneNumber'] = 'Valid Phone Number required';
				}
			},

			validPhone: function (phoneNumber) {
				var phoneRegEx = /\d{2,10}$/;
				if (phoneNumber.match(phoneRegEx)) {
					return true;
				} else {
					return false;
				}
			},
			checkEmpty: function (value) {
				var id = event.target.id;
				if (!value) {
					switch (id) {
					case 'phoneNumber':
						this.errors[id] = 'Please fill your Phone Number';
						break;
					case 'email':
						this.errors[id] = "Please fill your Email";
						break;
					case 'firstName':
						this.errors[id] = 'Please fill your First Name';
						break;
					case 'lastName':
						this.errors[id] = 'Please fill your Last Name';
						break;
					case 'address':
						this.errors[id] = 'Please fill your Address';
						break;
					}
				}
				if(value) {
					switch (id) {
						case 'email':
							this.errors[id] = (this.validEmail(value) ? ' ' : "Please enter a valid email");
							break;
						case 'phoneNumber':
							this.errors[id] = (this.validPhone(value) ? ' ' : "Please enter a valid Phone Number");
					}
				}
			},
			checkEmail: function (value) {
				if(!value) {
					console.log(event.target.id);

					this.errors['email'] = 'Please fill your Email';
				} else if (!validEmail(value)) {
					this.errors[event.target.id] = 'Please enter a valid Email';
				}
			},
			selectContact: function (index) {
				if (this.isBeingEdited) {
					return false;
				}
				if (this.selectedIndex === index) {
					this.selectedIndex = null;
					return false;
				}
				this.selectedIndex = index ;
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
				if (this.selectedIndex === null) {
					this.isBeingEdited = false;
					this.indexOfEditing = null;
					this.resetForm();
					return false;
				}
				this.contact = {...this.contacts[this.selectedIndex]};
				this.isBeingEdited = true;
				this.indexOfEditing = this.selectedIndex;
			},
			removeContact: function (event) {
				if (this.selectedIndex === null) {
					return false;
				}
				var confirmDelete = confirm('Are you sure you want to delete the selected item');

				if (!confirmDelete) {
					return false;
				}
				this.contacts.splice(this.selectedIndex,1);

				if(this.contacts.length === 0) {
					this.isHidden = true;
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
			getObjectLength: function (obj) {
				return Object.keys(obj).length;
			}
		}
	});
});
