import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
const schema=z.object({alt:z.string().max(300).optional().nullable(),caption:z.string().max(1000).optional().nullable(),url:z.string().min(1).optional()});
export async function PUT(request:Request,{params}:{params:Promise<{id:string;imageId:string}>}){if(!(await auth())?.user)return NextResponse.json({error:"Unauthorized"},{status:401});const{id:projectId,imageId}=await params;const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid image"},{status:400});const result=await prisma.projectImage.updateMany({where:{id:imageId,projectId},data:parsed.data});return result.count?NextResponse.json({success:true}):NextResponse.json({error:"Not found"},{status:404})}
export async function DELETE(_:Request,{params}:{params:Promise<{id:string;imageId:string}>}){if(!(await auth())?.user)return NextResponse.json({error:"Unauthorized"},{status:401});const{id:projectId,imageId}=await params;const result=await prisma.projectImage.deleteMany({where:{id:imageId,projectId}});return result.count?NextResponse.json({success:true}):NextResponse.json({error:"Not found"},{status:404})}
