import { EnvironmentModel } from "./environment-model";

// export const environment: EnvironmentModel = {
//   production: false,
//   authApiUrl: 'http://localhost:5197' ,
//   aiApiUrl: 'http://localhost:5007' ,
//   fileUrl:"http://localhost:5163",
// };
export const environment: EnvironmentModel = {
  production: true,
  authApiUrl: 'https://auth.mc-blog.space' ,
  aiApiUrl: 'https://ai.mc-blog.space' ,
  fileUrl:"https://file.mc-blog.space",
};
