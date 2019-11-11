import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript


export const helloWorld = functions.https.onRequest((request, response) => {
    //general testing function for implementing data structures
    const places = admin.database().ref('/sessions/places_suggestions').orderByChild('numVotes').limitToFirst(1).once('value')
    .then(function(data) {
        data.forEach(function(placeElement) {
            console.log(placeElement.val().place_id)
            return true
        });
        response.send(data.key)
    });
    places.catch((error) => {
        console.log("Crit: DB Fail");
        response.send('oof')
    });
});

export const sendNotifications = functions.https.onRequest((request, response) => {
    let place_id: string = "null"
    let photoRef: string = "null"
    let place_address: string = "null"
    let place_name: string = "null"
    let message

    const places = admin.database().ref('/sessions/places_suggestions')
    .orderByChild('numVotes').limitToLast(1).once('value').then(function(data) {
        data.forEach(function(placeElement) {
            place_id = placeElement.val().place_id
            console.log(place_id);
            photoRef = placeElement.val().photoRef
            console.log(photoRef)
            place_address = placeElement.val().place_address
            console.log(place_address)
            place_name = placeElement.val().place_name
            console.log(place_name)
            message = {
                notification: {
                    title: 'Session Ended',
                    body: 'Place: {place_name}'
                },
                data: {
                    place_id: place_id,
                    photoRef: photoRef,
                    place_address: place_address,
                    place_name: place_name
                },
                topic: request.body.data.sessionID
                };
        
        // Send a message to devices subscribed to the provided topic.
            admin.messaging().send(message)
            .then((res) => { //don't shadow response here or the function will break
                console.log('Sent notification for session ID:',request.body.data.sessionID);
                console.log(res);
                return 0;
            })
            .catch((error) => {
                console.log('Error sending message:', error);
                console.log('Session ID:',request.body.data.sessionID);
                return 1;
              });
        });
    //TODO: filter the data with this: orderByChild('isOpen').equalTo(true) to only consider open businesses
    });
    places.catch((error) => {
        console.log("Crit: DB Failed")
    });
    
      response.send('OK');
});

