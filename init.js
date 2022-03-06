document.addEventListener('DOMContentLoaded', () => {

    let shared, my, participants;
    let client, room;

    async function init() {
      //create a new client and connect to server
        client = new party.Client("wss://deepstream-server-1.herokuapp.com");
        await client.whenReady();
    
        //create a room
        room = new party.Room(client, "bs.ar.3", "main");
        await room.whenReady();
    
        //join the room and remove any clients who are no longer present
        room.join();
        room.removeDisconnectedClients();
    
        //create a record that will be used for transporting data between users
        const record = room.getRecord("test");
        await record.whenReady();
        //console.log(record.shared);
    
        //get the shared object from the record
        shared = record.getShared();
        participants = room.getParticipantShareds();
        //shared.log = [];
        //console.log(room.getHostName() === client.getUid());
    
        const myrecord = room.getMyRecord();
        await myrecord.whenReady();
    
        my = myrecord.getShared();
    
        participants = room.getParticipantShareds();
    
        //console.log(participants)
    
    
        //clean up on exit
        window.addEventListener("beforeunload", () => {
            shared.log = [];
            room.leave();
            client.close();
        });

        let randomIndex = Math.floor(Math.random() * 10) + 1;
        //console.log("./q-data/bell-0" + `${randomIndex}.json`);

        $.getJSON( "./q-data/bell-00" + `${randomIndex}.json`, function( json ) {
            //console.log(json.shots);
            setup(client, room, shared, my, participants, json);
        });
    
        //record.watchShared(onChange);
    }
    
    init();

});