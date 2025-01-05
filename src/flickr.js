import Axios from 'axios';
const axios = Axios.create(); 

export default function flickr() {
	return {
		api_key: "8aeef052c6f174887d014d94a277644e",
		user_id: "79752071@N00",
		setArray: [],
		sets: {},
		photos: {},
		nullPhoto: {id:"",thumburi:"",largeuri:""},
		selectedPhoto: {id:"",thumburi:"",largeuri:""},
		nullSet: {id:"", photo:[]},
		selectedSet: {id:"", photo:[]},

		async init() {
			this.setArray = await this.getSets();

			for(const i of this.setArray) {
				this.sets[i.id] = await this.getSetDetail(i.id);

				let set = this.sets[i.id];
				//set.primary = await this.getPhotoDetails(set.primary);
				set.primary = set.photo.filter(p => {
					return p.id === set.primary
				})[0];
				
				set.primary.largeuri = this.buildPhotoURI(set.primary);
				set.primary.thumburi = this.buildPhotoURI(set.primary, 'q');

			};

		},
	
		async getSets() {
			let result = await axios.get('https://www.flickr.com/services/rest/', 
				{	
					params: {
						method: "flickr.collections.getTree",
						api_key: this.api_key,
						collection_id: "1209789-72157622177072416",
						user_id: this.user_id,
						format: "json",
						nojsoncallback: 1,
					}
				}
			);
			if (result.data.stat != 'ok') {
				throw new Error(result.data.message);
			}
			return result.data.collections.collection[0].set;
		},

		async getSetDetail(setID) {
			let result = await axios.get('https://www.flickr.com/services/rest/', 
				{
					params: {
						method: "flickr.photosets.getPhotos",
						api_key: this.api_key,
						photoset_id: setID,
						user_id: this.user_id,
						format: "json",
						nojsoncallback: 1
					}
				}
			);
			if (result.data.stat != 'ok') {
				throw new Error(result.data.message);
			}

			result.data.photoset.title = result.data.photoset.title.replace('WebsiteSet-', '');

			for (const p of result.data.photoset.photo) {
				p.thumburi = this.buildPhotoURI(p, 'q');
				p.largeuri = this.buildPhotoURI(p);
				this.photos[p.id] = p;
			}

			return result.data.photoset;
		},

		async getPhotoDetails(photoID) {
			let result = await axios.get('https://www.flickr.com/services/rest/', 
				{
					params: {
						method: "flickr.photos.getInfo",
						api_key: this.api_key,
						photo_id: photoID,
						format: "json",
						nojsoncallback: 1
					}
				}
			)
			if (result.data.stat != 'ok') {
				throw new Error(result.data.message);
			}

			this.photos[photoID] = result.data.photo;
			return result.data.photo;
		},

		selectSetByID(setID='') {
			if (setID != '') {
				this.selectedSet = this.sets[setID];
			} else {
				this.selectedSet = this.nullSet;
				this.selectedPhoto = this.nullPhoto;
			}	
		},
		
		selectPhotoByID(photoID='') {
			if (photoID != '') {
				this.selectedPhoto = this.photos[photoID];
			} else {
				this.selectedPhoto = this.nullPhoto;
			}
		},

		buildPhotoURI(p, size='b') {
				return `https://farm2.staticflickr.com/1103/${p.id}_${p.secret}_${size}.jpg`;
		},

		prevPhoto() {
			if (this.selectedSet.id == "") { this.selectSetByID(this.setArray[0].id); }
			if (this.selectedPhoto.id == "") { this.selectedPhoto = this.selectedSet.photo[0]; return; }

			this.selectedPhoto = this.selectedSet.photo.filter((p, i, arr) => {
				return arr.length > i+1 ? arr[i+1].id === this.selectedPhoto.id : arr[0].id === this.selectedPhoto.id;
			})[0];
		},

		nextPhoto() {
			if (this.selectedSet.id == "") { this.selectSetByID(this.setArray[0].id); }
			if (this.selectedPhoto.id == "") { this.selectedPhoto = this.selectedSet.photo[0]; return; }

			this.selectedPhoto = this.selectedSet.photo.filter((p, i, arr) => {
				return 0 < i ? arr[i-1].id === this.selectedPhoto.id : arr[arr.length-1].id === this.selectedPhoto.id;
			})[0];
		},

		escape() {
			if (this.selectedPhoto.id != "") { this.selectPhotoByID(); return; }
			if (this.selectedSet.id != "") { this.selectSetByID(); }
		}
	}
}