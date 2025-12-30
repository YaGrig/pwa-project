DROP TABLE IF EXISTS users CASCADE;

DROP TABLE IF EXISTS transactions CASCADE;

DROP TABLE IF EXISTS users_notification CASCADE;

DROP TABLE IF EXISTS notification CASCADE;

DROP TABLE IF EXISTS income CASCADE;

CREATE TYPE period_type AS ENUM ('all', 'year', 'month', 'week', 'day');

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

CREATE TABLE user_summary (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period period_type NOT NULL,
    period_start DATE NOT NULL,
    -- начальная дата периода
    period_end DATE NOT NULL,
    -- конечная дата периода
    username VARCHAR(30),
    email VARCHAR(100),
    -- Основные метрики
    transactions_count INTEGER DEFAULT 0,
    expenses_count INTEGER DEFAULT 0,
    incomes_count INTEGER DEFAULT 0,
    -- Суммы
    total_amount NUMERIC(10, 2) DEFAULT 0,
    total_expenses NUMERIC(10, 2) DEFAULT 0,
    total_incomes NUMERIC(10, 2) DEFAULT 0,
    avg_transaction_amount NUMERIC(10, 2) DEFAULT 0,
    -- Баланс
    opening_balance NUMERIC(10, 2) DEFAULT 0,
    closing_balance NUMERIC(10, 2) DEFAULT 0,
    net_balance_change NUMERIC(10, 2) DEFAULT 0,
    -- Даты
    first_transaction_date TIMESTAMP,
    last_transaction_date TIMESTAMP,
    -- Категории (если будут)
    top_category VARCHAR(100),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    -- Ограничения
    CHECK (period_end >= period_start),
    UNIQUE(user_id, period, period_start)
);

CREATE INDEX user_id_transaction_indx ON transactions (user_id);

CREATE INDEX user_id_income_indx ON income (user_id);

-- Удаляем старые функции
DROP FUNCTION IF EXISTS update_user_summary(integer);

DROP FUNCTION IF EXISTS update_user_summary_trigger();

-- Функция для обновления статистики за все периоды для пользователя
CREATE
OR REPLACE FUNCTION update_user_summary_all_periods(p_user_id INTEGER) RETURNS void AS $ $ BEGIN
INSERT INTO
    user_summary (
        user_id,
        period,
        period_start,
        period_end,
        username,
        email,
        transactions_count,
        total_expenses,
        total_incomes,
        closing_balance,
        last_transaction_date
    )
SELECT
    u.id AS user_id,
    'all' :: period_type AS period,
    MIN(t.created_at) :: DATE AS period_start,
    MAX(t.created_at) :: DATE AS period_end,
    u.username,
    u.email,
    COUNT(t.id) AS transactions_count,
    COALESCE(
        SUM(
            CASE
                WHEN t.amount < 0 THEN ABS(t.amount)
                ELSE 0
            END
        ),
        0
    ) AS total_expenses,
    COALESCE(
        SUM(
            CASE
                WHEN t.amount > 0 THEN t.amount
                ELSE 0
            END
        ),
        0
    ) AS total_incomes,
    COALESCE(SUM(t.amount), 0) AS closing_balance,
    MAX(t.created_at) AS last_transaction_date
FROM
    users u
    LEFT JOIN transactions t ON u.id = t.user_id
WHERE
    u.id = p_user_id
GROUP BY
    u.id ON CONFLICT (user_id, period, period_start) DO
UPDATE
SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    transactions_count = EXCLUDED.transactions_count,
    total_expenses = EXCLUDED.total_expenses,
    total_incomes = EXCLUDED.total_incomes,
    closing_balance = EXCLUDED.closing_balance,
    last_transaction_date = EXCLUDED.last_transaction_date,
    updated_at = NOW();

-- 2. Помесячная статистика
INSERT INTO
    user_summary (
        user_id,
        period,
        period_start,
        period_end,
        transactions_count,
        total_expenses,
        total_incomes,
        closing_balance
    )
SELECT
    u.id AS user_id,
    'month' :: period_type AS period,
    DATE_TRUNC('month', t.created_at) :: DATE AS period_start,
    (
        DATE_TRUNC('month', t.created_at) + INTERVAL '1 month' - INTERVAL '1 day'
    ) :: DATE AS period_end,
    COUNT(t.id) AS transactions_count,
    COALESCE(
        SUM(
            CASE
                WHEN t.amount < 0 THEN ABS(t.amount)
                ELSE 0
            END
        ),
        0
    ) AS total_expenses,
    COALESCE(
        SUM(
            CASE
                WHEN t.amount > 0 THEN t.amount
                ELSE 0
            END
        ),
        0
    ) AS total_incomes,
    COALESCE(SUM(t.amount), 0) AS closing_balance
FROM
    users u
    INNER JOIN transactions t ON u.id = t.user_id
WHERE
    u.id = p_user_id
GROUP BY
    u.id,
    DATE_TRUNC('month', t.created_at) ON CONFLICT (user_id, period, period_start) DO
UPDATE
SET
    transactions_count = EXCLUDED.transactions_count,
    total_expenses = EXCLUDED.total_expenses,
    total_incomes = EXCLUDED.total_incomes,
    closing_balance = EXCLUDED.closing_balance,
    updated_at = NOW();

-- 3. Ежедневная статистика (за последние 30 дней для производительности)
INSERT INTO
    user_summary (
        user_id,
        period,
        period_start,
        period_end,
        transactions_count,
        total_expenses,
        total_incomes,
        closing_balance
    )
SELECT
    u.id AS user_id,
    'day' :: period_type AS period,
    t.created_at :: DATE AS period_start,
    t.created_at :: DATE AS period_end,
    COUNT(t.id) AS transactions_count,
    COALESCE(
        SUM(
            CASE
                WHEN t.amount < 0 THEN ABS(t.amount)
                ELSE 0
            END
        ),
        0
    ) AS total_expenses,
    COALESCE(
        SUM(
            CASE
                WHEN t.amount > 0 THEN t.amount
                ELSE 0
            END
        ),
        0
    ) AS total_incomes,
    COALESCE(SUM(t.amount), 0) AS closing_balance
FROM
    users u
    INNER JOIN transactions t ON u.id = t.user_id
WHERE
    u.id = p_user_id
    AND t.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY
    u.id,
    t.created_at :: DATE ON CONFLICT (user_id, period, period_start) DO
UPDATE
SET
    transactions_count = EXCLUDED.transactions_count,
    total_expenses = EXCLUDED.total_expenses,
    total_incomes = EXCLUDED.total_incomes,
    closing_balance = EXCLUDED.closing_balance,
    updated_at = NOW();

END;

$ $ LANGUAGE plpgsql;

-- Упрощенная триггерная функция
CREATE
OR REPLACE FUNCTION update_user_summary_trigger() RETURNS TRIGGER AS $ $ DECLARE v_user_id INTEGER;

v_affected_date DATE;

BEGIN -- Определяем user_id и дату транзакции
IF TG_OP = 'INSERT'
OR TG_OP = 'UPDATE' THEN v_user_id := NEW.user_id;

v_affected_date := NEW.created_at :: DATE;

ELSE v_user_id := OLD.user_id;

v_affected_date := OLD.created_at :: DATE;

END IF;

-- Обновляем статистику для пользователя
PERFORM update_user_summary_all_periods(v_user_id);

-- Дополнительно обновляем статистику за конкретный месяц
-- для оптимизации, если транзакций много
PERFORM update_user_summary_for_month(
    v_user_id,
    DATE_TRUNC('month', v_affected_date) :: DATE
);

RETURN NULL;

END;

$ $ LANGUAGE plpgsql;

-- Функция для обновления конкретного месяца
CREATE
OR REPLACE FUNCTION update_user_summary_for_month(p_user_id INTEGER, p_month_date DATE) RETURNS void AS $ $ BEGIN -- Обновляем статистику за конкретный месяц
INSERT INTO
    user_summary (
        user_id,
        period,
        period_start,
        period_end,
        transactions_count,
        total_expenses,
        total_incomes,
        closing_balance
    )
SELECT
    u.id AS user_id,
    'month' :: period_type AS period,
    DATE_TRUNC('month', t.created_at) :: DATE AS period_start,
    (
        DATE_TRUNC('month', t.created_at) + INTERVAL '1 month' - INTERVAL '1 day'
    ) :: DATE AS period_end,
    COUNT(t.id) AS transactions_count,
    COALESCE(
        SUM(
            CASE
                WHEN t.amount < 0 THEN ABS(t.amount)
                ELSE 0
            END
        ),
        0
    ) AS total_expenses,
    COALESCE(
        SUM(
            CASE
                WHEN t.amount > 0 THEN t.amount
                ELSE 0
            END
        ),
        0
    ) AS total_incomes,
    COALESCE(SUM(t.amount), 0) AS closing_balance
FROM
    users u
    INNER JOIN transactions t ON u.id = t.user_id
WHERE
    u.id = p_user_id
    AND DATE_TRUNC('month', t.created_at) = DATE_TRUNC('month', p_month_date)
GROUP BY
    u.id,
    DATE_TRUNC('month', t.created_at) ON CONFLICT (user_id, period, period_start) DO
UPDATE
SET
    transactions_count = EXCLUDED.transactions_count,
    total_expenses = EXCLUDED.total_expenses,
    total_incomes = EXCLUDED.total_incomes,
    closing_balance = EXCLUDED.closing_balance,
    updated_at = NOW();

END;

$ $ LANGUAGE plpgsql;

-- Триггер (оставляем как есть)
CREATE TRIGGER update_summary_after_transaction
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON transactions FOR EACH ROW EXECUTE FUNCTION update_user_summary_trigger();

-- Вставляем тестового пользователя
INSERT INTO
    users (
        username,
        email,
        hashed_password,
        refresh_token,
        user_role
    )
VALUES
    (
        'test_user',
        'test@example.com',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        -- пароль: password
        'refresh_token_123',
        'User'
    ) ON CONFLICT (username) DO NOTHING;

-- Получаем ID созданного пользователя
DO $ $ DECLARE test_user_id INTEGER;

BEGIN
SELECT
    id INTO test_user_id
FROM
    users
WHERE
    username = 'test_user';

-- Вставляем транзакции для последних 3 месяцев
INSERT INTO
    transactions (amount, description, created_at, user_id)
VALUES
    -- Январь 2024
    (
        -1500.00,
        'Продукты',
        '2024-01-05 10:30:00',
        test_user_id
    ),
    (
        -300.00,
        'Кофе',
        '2024-01-05 12:15:00',
        test_user_id
    ),
    (
        50000.00,
        'Зарплата',
        '2024-01-10 09:00:00',
        test_user_id
    ),
    (
        -2500.00,
        'Аренда квартиры',
        '2024-01-15 14:00:00',
        test_user_id
    ),
    (
        -800.00,
        'Ресторан',
        '2024-01-20 19:45:00',
        test_user_id
    ),
    (
        -1200.00,
        'Одежда',
        '2024-01-25 16:20:00',
        test_user_id
    ),
    -- Февраль 2024
    (
        -1800.00,
        'Продукты',
        '2024-02-03 11:10:00',
        test_user_id
    ),
    (
        -350.00,
        'Кафе',
        '2024-02-07 13:25:00',
        test_user_id
    ),
    (
        50000.00,
        'Зарплата',
        '2024-02-10 09:00:00',
        test_user_id
    ),
    (
        -2500.00,
        'Аренда квартиры',
        '2024-02-15 14:00:00',
        test_user_id
    ),
    (
        -1500.00,
        'Кино',
        '2024-02-18 21:00:00',
        test_user_id
    ),
    (
        -900.00,
        'Книги',
        '2024-02-22 15:40:00',
        test_user_id
    ),
    -- Март 2024 (текущий месяц)
    (
        -2000.00,
        'Продукты',
        CURRENT_DATE - INTERVAL '5 days',
        test_user_id
    ),
    (
        -400.00,
        'Кофе с друзьями',
        CURRENT_DATE - INTERVAL '3 days',
        test_user_id
    ),
    (
        50000.00,
        'Зарплата',
        CURRENT_DATE - INTERVAL '2 days',
        test_user_id
    ),
    (
        -2500.00,
        'Аренда квартиры',
        CURRENT_DATE - INTERVAL '1 day',
        test_user_id
    ),
    (
        -1200.00,
        'Ремонт техники',
        CURRENT_DATE,
        test_user_id
    ),
    -- Некоторые доходы как положительные транзакции
    (
        3000.00,
        'Фриланс',
        '2024-01-28 17:00:00',
        test_user_id
    ),
    (
        2500.00,
        'Премия',
        '2024-02-25 10:30:00',
        test_user_id
    ),
    (
        2000.00,
        'Кэшбэк',
        CURRENT_DATE - INTERVAL '7 days',
        test_user_id
    );

-- Вставляем доходы (отдельная таблица income)
INSERT INTO
    income (amount, description, created_at, user_id)
VALUES
    (
        1000.00,
        'Дивиденды по акциям',
        '2024-01-07 12:00:00',
        test_user_id
    ),
    (
        1500.00,
        'Сдача квартиры',
        '2024-02-12 14:30:00',
        test_user_id
    ),
    (
        800.00,
        'Проценты по вкладу',
        CURRENT_DATE - INTERVAL '10 days',
        test_user_id
    );

-- Создаем уведомления
INSERT INTO
    notification (content, created_at)
VALUES
    (
        'Добро пожаловать в систему финансового учета!',
        CURRENT_DATE - INTERVAL '30 days'
    ),
    (
        'Вы добавили первую транзакцию',
        CURRENT_DATE - INTERVAL '25 days'
    ),
    (
        'Напоминание: проведите анализ расходов за месяц',
        CURRENT_DATE - INTERVAL '15 days'
    ),
    (
        'Новый функционал: теперь доступна статистика по категориям',
        CURRENT_DATE - INTERVAL '7 days'
    ),
    (
        'Еженедельный отчет: ваши расходы выросли на 15%',
        CURRENT_DATE - INTERVAL '2 days'
    ),
    ('Ваш баланс обновлен', CURRENT_DATE);

-- Связываем уведомления с пользователем
INSERT INTO
    users_notification (user_id, notification_id, isRead)
SELECT
    test_user_id,
    n.id,
    CASE
        WHEN n.created_at < CURRENT_DATE - INTERVAL '1 day' THEN TRUE
        ELSE FALSE
    END
FROM
    notification n;

-- Обновляем статистику для пользователя
PERFORM update_user_summary_all_periods(test_user_id);

-- Выводим итоговую статистику для проверки
RAISE NOTICE 'Данные успешно добавлены для пользователя ID: %',
test_user_id;

RAISE NOTICE 'Количество транзакций: %',
(
    SELECT
        COUNT(*)
    FROM
        transactions
    WHERE
        user_id = test_user_id
);

RAISE NOTICE 'Количество доходов: %',
(
    SELECT
        COUNT(*)
    FROM
        income
    WHERE
        user_id = test_user_id
);

RAISE NOTICE 'Количество уведомлений: %',
(
    SELECT
        COUNT(*)
    FROM
        users_notification
    WHERE
        user_id = test_user_id
);

END $ $;