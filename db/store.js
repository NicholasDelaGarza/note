const util = require('util');
const fs = require('fs');
//generates unique ids
const uuid = require('uuid/v1');

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

class Store {
    read() {
        return readFileAsync('db/db.json', 'utf8');
    }
    write(note) {
        return writeFileAsync('db/db.json', JSON.stringify(note));
    }
    getNotes() {
        return this.read().then(notes => {
            let parsedNotes;

            try {
                parsedNotes = [].concat(JSON.parse(notes));
            } catch (err) {
                parsedNotes = [];
            }

            return parsedNotes;
        });
    }

    addNote(note) {
        const { title, text } = note;

        if(!title || ! text) {
            throw new Error('Note title and text cannot be blank')
        }

        const newNote = { title, text, id: uuid() };

        return this.getNotes()
        .then(notes => [...notes, newNote])
        .then(updateNotes => this.write(updateNotes))
        .then(() => newNote);
    }
    removeNote(id) {
        // Get all notes, remove the note with the given id, write the filtered notes
        return this.getNotes()
          .then(notes => notes.filter(note => note.id !== id))
          .then(filteredNotes => this.write(filteredNotes));
      }
}

module.exports = new Store();