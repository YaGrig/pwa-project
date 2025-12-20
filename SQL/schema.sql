DROP TABLE IF EXISTS users CASCADE;

DROP TABLE IF EXISTS transactions CASCADE;

DROP TABLE IF EXISTS users_notification CASCADE;

DROP TABLE IF EXISTS notification CASCADE;

DROP TABLE IF EXISTS income CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(100) CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255),
    user_role VARCHAR(255) NOT NULL CHECK(user_role IN ('Admin', 'User'))
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    photo_url VARCHAR(255),
    user_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notification (
    id SERIAL PRIMARY KEY,
    content VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users_notification (
    user_id INTEGER NOT NULL,
    notification_id INTEGER NOT NULL,
    isRead BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (user_id, notification_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(notification_id) REFERENCES notification(id) ON DELETE CASCADE
);

CREATE TABLE income (
    id SERIAL PRIMARY KEY,
    amount NUMERIC(10, 2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE MATERIALIZED VIEW user_summary AS
SELECT
    u.id as user_id,
    u.username,
    COUNT(t.id) as total_transactions,
    COUNT(i.id) as total_income,
    COALESCE(SUM(t.amount), 0) as total_expenses,
    COALESCE(SUM(i.amount), 0) as total_incomes,
    COALESCE(
        COALESCE(SUM(i.amount), 0) - COALESCE(SUM(t.amount), 0),
        0
    ) as balance
FROM
    users u
    LEFT JOIN transactions t ON u.id = t.user_id
    LEFT JOIN income i ON u.id = i.user_id
GROUP BY
    u.id,
    u.username
ORDER BY
    u.id;

CREATE INDEX user_id_transaction_indx ON transactions (user_id);

CREATE INDEX user_id_income_indx ON income (user_id);

CREATE UNIQUE INDEX idx_user_summary_user_id ON user_summary (user_id);

INSERT INTO
    users (username, email, hashed_password, user_role)
VALUES
    (
        'alice',
        'alice@example.com',
        '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr.7.6uZ3Xp6WXWq5Lq5J5YV',
        'User'
    ),
    (
        'bob',
        'bob@example.com',
        '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr.7.6uZ3Xp6WXWq5Lq5J5YV',
        'User'
    ),
    (
        'charlie',
        'charlie@example.com',
        '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr.7.6uZ3Xp6WXWq5Lq5J5YV',
        'Admin'
    );

-- Вставка 100 доходов для 2 пользователей (по 50 на каждого)
INSERT INTO
    income (amount, description, user_id, created_at)
SELECT
    ROUND((RANDOM() * 50000 + 1000) :: NUMERIC, 2) as amount,
    CASE
        WHEN MOD(i, 4) = 0 THEN 'Зарплата за ' || CASE
            WHEN MOD(i, 12) = 0 THEN 'январь'
            WHEN MOD(i, 12) = 1 THEN 'февраль'
            WHEN MOD(i, 12) = 2 THEN 'март'
            WHEN MOD(i, 12) = 3 THEN 'апрель'
            WHEN MOD(i, 12) = 4 THEN 'май'
            WHEN MOD(i, 12) = 5 THEN 'июнь'
            WHEN MOD(i, 12) = 6 THEN 'июль'
            WHEN MOD(i, 12) = 7 THEN 'август'
            WHEN MOD(i, 12) = 8 THEN 'сентябрь'
            WHEN MOD(i, 12) = 9 THEN 'октябрь'
            WHEN MOD(i, 12) = 10 THEN 'ноябрь'
            ELSE 'декабрь'
        END
        WHEN MOD(i, 4) = 1 THEN 'Фриланс проект ' || i
        WHEN MOD(i, 4) = 2 THEN 'Подработка ' || i
        ELSE 'Пассивный доход ' || i
    END as description,
    CASE
        WHEN i <= 50 THEN 1 -- Первые 50 записей для user_id=1 (alice)
        ELSE 2 -- Следующие 50 для user_id=2 (bob)
    END as user_id,
    NOW() - (RANDOM() * 180 || ' days') :: INTERVAL as created_at
FROM
    generate_series(1, 100) as i;

-- Вставка 100 транзакций для 2 пользователей (по 50 на каждого)
INSERT INTO
    transactions (amount, description, user_id, created_at)
SELECT
    ROUND((RANDOM() * 5000 + 10) :: NUMERIC, 2) as amount,
    CASE
        WHEN MOD(i, 6) = 0 THEN 'Продукты ' || i
        WHEN MOD(i, 6) = 1 THEN 'Транспорт ' || i
        WHEN MOD(i, 6) = 2 THEN 'Кафе ' || i
        WHEN MOD(i, 6) = 3 THEN 'Развлечения ' || i
        WHEN MOD(i, 6) = 4 THEN 'Коммунальные платежи ' || i
        ELSE 'Покупки ' || i
    END as description,
    CASE
        WHEN i <= 50 THEN 1 -- Первые 50 записей для user_id=1
        ELSE 2 -- Следующие 50 для user_id=2
    END as user_id,
    NOW() - (RANDOM() * 180 || ' days') :: INTERVAL as created_at
FROM
    generate_series(1, 100) as i;

-- Обновление материализованного представления
REFRESH MATERIALIZED VIEW CONCURRENTLY user_summary;