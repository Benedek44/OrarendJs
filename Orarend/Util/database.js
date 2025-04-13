import sqlite from 'sqlite3';

const db = new sqlite.Database('./Data/database.sqlite');

export function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);

      else resolve(rows);
    });
  });
}

export function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);

      else resolve(row);
    });
  });
}

export function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);

            else resolve(this);
        });
    });
}

export async function initializeDatabase() {
    await dbRun('DROP TABLE IF EXISTS timetable');
    await dbRun('CREATE TABLE IF NOT EXISTS timetable (id INTEGER PRIMARY KEY AUTOINCREMENT, day STRING, classNumber INTEGER, className STRING)');
    const days = [
      {
        day: 'Hétfő',
        classes: [
          { classNumber: 1, className: "Matek" },
          { classNumber: 2, className: "Fizika" },
          { classNumber: 3, className: "Irodalom" },
          { classNumber: 4, className: "Történelem" },
          { classNumber: 5, className: "Angol" },
          { classNumber: 6, className: "Biológia" },
          { classNumber: 7, className: "Kémia" },
          { classNumber: 8, className: "Testnevelés" }
        ]
      },
      {
        day: 'Kedd',
        classes: [
          { classNumber: 1, className: "Fizika" },
          { classNumber: 2, className: "Matek" },
          { classNumber: 3, className: "Irodalom" },
          { classNumber: 4, className: "Történelem" },
          { classNumber: 5, className: "Angol" },
          { classNumber: 6, className: "Biológia" },
          { classNumber: 7, className: "Kémia" }
        ]
      },
      {
        day: 'Szerda',
        classes: [
          { classNumber: 1, className: "Matek" },
          { classNumber: 2, className: "Fizika" },
          { classNumber: 3, className: "Irodalom" },
          { classNumber: 4, className: "Történelem" },
          { classNumber: 5, className: "Angol" }
        ]
      },
      {
        day: 'Csütörtök',
        classes: [
          { classNumber: 1, className: "Biológia" },
          { classNumber: 2, className: "Kémia" },
          { classNumber: 3, className: "Matek" },
          { classNumber: 4, className: "Fizika" },
          { classNumber: 5, className: "Irodalom" },
          { classNumber: 6, className: "Történelem" },
          { classNumber: 7, className: "Angol" },
          { classNumber: 8, className: "Testnevelés" }
        ]
      },
      {
        day: 'Péntek',
        classes: [
          { classNumber: 1, className: "Matek" },
          { classNumber: 2, className: "Fizika" },
          { classNumber: 3, className: "Irodalom" },
          { classNumber: 4, className: "Történelem" },
          { classNumber: 5, className: "Angol" },
          { classNumber: 6, className: "Biológia" }
        ]
      }
    ];

    for (const day of days) {
      for (const classInfo of day.classes) {
        await dbRun('INSERT INTO timetable (day, classNumber, className) VALUES (?, ?, ?)', [
          day.day,
          classInfo.classNumber,
          classInfo.className
        ]);
      }
    }
}