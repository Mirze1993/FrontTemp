export interface AuthState  {
    token: string;
    refToken:string;
    id: number;
    name?: string;
    email?: string;
    photo?: string;
    claims?:UserClaim[];
    loading?: boolean;
  }

  export interface User  {
    id: number;
    name: string;
    email?: string;
    avatarUrl?: string;
  }

  export class Session{
    token?:string;
    refreshToken?:string
    constructor(token?: string,refreshToken?:string) {
      this.refreshToken = refreshToken,
      this.token=token;
  }
  }


  export class LoginUserReq {
    email?: string
    password?: string
  }

  export class LoginByRefTokReq {
    refreshToken?: string
    id?  :number
    constructor(refreshToken?: string,id?:number) {
        this.refreshToken = refreshToken,
        this.id=id;
    }
  }



  export class Token_Decode {
    Name?: string
    Email?: string
    nbf?: string
    exp?: string
    iat?: string
    iss?: string
    aud?: string
    Role?:string[]
    Id?: number;
  }
  export class UserClaim{

    type? :ClaimType;
    value? : string;
    valueType? : string;
    issuer? : string;
    id? : number;
  }

  export interface UserInfoResp{
    id:number;
    name?:string;
    email?:string;
    photo?:string;
  }

  export class SearchUserResp{
    name?:string;
    photo?:string;
    appUserId?:number;
    email?:string
  }

  export class UpdateProfilReq{
    columnName? :ClaimType;
    newValue? : string;
    editType? : string;
    oldId? : number;
    userId? : number
  }
  export enum EditType{
    Insert = "Insert",
    Update = "Update",
    Delete = "Delete"
  }

  export class RoleValue{
    name?:string;
    id?:string;
    typeName?:number
  }

  export class SetClaimReq{
    UserId?:number;
     ClaimType?: string ;
     Value?: string[]
  }

  export interface Register {
    name: string
    email: string
    password: string
  }


  export enum ClaimType{
    Name = "Name",
    Role = "Role",
    ProfilPictur = "Picture",
    PhoneNumber = "PhoneNumber",
    Adress = "Adress",
    Education = "Education",
    JobPosission = "JobPosission",
    Birthday = "Birthday",
    Bio = "Bio",
    AdditionalDetails = "AdditionalDetails",
    Experience = "Experience",

    GoogleLogin = "GoogleLogin",
    GoogleId = "GoogleId",
    ServerAuthCode = "ServerAuthCode"

  }

  export interface NotifResp{

  id:number;
  title:string;
  body :string;
  isRead:boolean;
  createDate:Date;
  icon:string;
  type :number;
  userId:number
  }

  export interface intList{
    values:number[]
  }

  export interface  position{
    id?: number,
    parentId?: number,
    name: string,
    description: string
  }
