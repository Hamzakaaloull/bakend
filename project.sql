-- جدول المستخدمين (الأساتذة والإداريون)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher') NOT NULL
);

-- جدول الدروس (Cours)
CREATE TABLE cours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    document TEXT
);

-- جدول الفوج (Brigade)
CREATE TABLE brigade (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL
);

-- جدول الحصص (Seance)
CREATE TABLE seance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    timeSeance TIME NOT NULL,
    cours_id INT NOT NULL,
    brigade_id INT NOT NULL,
    user_id INT NOT NULL,  -- الأستاذ الذي يعرض الدرس
    CONSTRAINT fk_seance_cours FOREIGN KEY (cours_id) REFERENCES cours(id),
    CONSTRAINT fk_seance_brigade FOREIGN KEY (brigade_id) REFERENCES brigade(id),
    CONSTRAINT fk_seance_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- جدول الحضور (Presence)
CREATE TABLE presence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,   -- المستخدم (الأستاذ) الذي يتم تسجيل حضوره
    seance_id INT NOT NULL,
    time_present TIME NOT NULL,
    CONSTRAINT fk_presence_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_presence_seance FOREIGN KEY (seance_id) REFERENCES seance(id)
);

-- جدول السجل (Historique) لتسجيل بيانات الحصص وتفاصيل الأنشطة
CREATE TABLE historique (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seance_id INT NOT NULL,
    user_id INT NOT NULL,
    notes TEXT,  -- ملاحظات اختيارية حول الإجراء
    CONSTRAINT fk_historique_seance FOREIGN KEY (seance_id) REFERENCES seance(id),
    CONSTRAINT fk_historique_user FOREIGN KEY (user_id) REFERENCES users(id)
);
