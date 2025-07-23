declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PORT: string;
			PRIVATE_KEY: string;
			REFRESH_KEY: string;
		}
	}
}

export {};