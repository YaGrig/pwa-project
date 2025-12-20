import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Pool, QueryResult, QueryResultRow } from 'pg'

interface TransactionQuery {
  query: string
  values: string[]
  dependsOn: { [key: string]: string }
}

// interface QueryResultCustom<T> {
//   oid: number
//   command: string
//   rows: T[]
// }

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool

  constructor() {
    this.pool = new Pool({
      host: 'postgres',
      port: 5432,
      user: 'user',
      password: 'pswd',
      database: 'db',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }

  async onModuleInit() {
    try {
      await this.pool.connect()
      console.log('connected to PSQL')
    } catch (error) {
      console.log(error)
    }
  }
  async onModuleDestroy() {
    try {
      await this.pool.end()
      console.log('disconnected from PSQL')
    } catch (error) {
      console.log(error)
    }
  }

  async query<T extends QueryResultRow>(
    query: string,
    values?: any[],
  ): Promise<QueryResult<T>> {
    try {
      // console.log('=== DATABASE QUERY DEBUG ===');
      // console.log('Query string:', query);
      // console.log('Query values:', values);
      // console.log(
      //   'Values types:',
      //   values?.map((v) => typeof v),
      // );
      const res = await this.pool.query(query, values)
      return res
    } catch (error) {
      console.error('Database query error:', error)
      throw error
    }
  }

  async transaction(
    queries: Record<string, TransactionQuery>,
  ): Promise<Record<string, QueryResult<QueryResultRow>>> {
    const client = await this.pool.connect()

    try {
      await client.query('BEGIN')
      const results: Record<string, QueryResult<QueryResultRow>> = {}

      for (const [key, q] of Object.entries(queries)) {
        results[key] = await client.query(q.query, q.values)
      }

      await client.query('COMMIT')
      return results
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('Transaction error:', error)
      throw error
    } finally {
      client.release()
    }
  }
}
