$(document).ready(function () {
	const app = new Vue({
		el: '#main',
		data: {
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
		},
		methods: {
			checkForm: function (e) {
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
					if(this.isBeingEdited){
						this.contacts[this.indexOfEditing] = this.contact;
					}else{
						this.contacts.push(this.contact);
						this.isHidden = false;
						this.contact = {
							firstName: '',
							lastName: '',
							address: '',
							phoneNumber: '',
							email: '',
						}
						$('.table').removeClass('hidden');
					}
					e.preventDefault();
					return true;
				}

				e.preventDefault();
				e.stopPropagation();
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
					$this.closest('tr').toggleClass('selected').siblings().removeClass('selected');

			},
			editContact: function (event) {
				var selected = $('.selected >td:first').text();
				if(selected.length===0){
					this.isBeingEdited = false;
					this.indexOfEditing = '';
					return false;
				}
				this.contact = this.contacts[parseInt(selected)];
				this.isBeingEdited = true;
				this.indexOfEditing = parseInt(selected);
			}
		}
	});
});
