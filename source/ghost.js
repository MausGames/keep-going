//////////////////////////////////////////////////////
//*------------------------------------------------*//
//| Part of Keep Going (https://www.maus-games.at) |//
//*------------------------------------------------*//
//| Copyright (c) 2020 Martin Mauersics            |//
//| Released under the zlib License                |//
//*------------------------------------------------*//
//////////////////////////////////////////////////////
"use strict";
class cGhostPart extends windObject {


// ****************************************************************
constructor(pModel, pShader)
{
    super();

    this.m_pModel  = pModel;
    this.m_pShader = pShader;

    this.m_vBase   = vec3.create();
    this.m_fTime   = 0.0;
}


// ****************************************************************
Render()
{
    if(this.m_fTime)
    {
        super.Render();
    }
}


// ****************************************************************
Move()
{
    if(this.m_fTime)
    {
        this.m_fTime = Math.max(this.m_fTime - 5.0 * WIND.g_fTime, 0.0);

        this.m_vSize[0] = this.m_vBase[0] * this.m_fTime;
        this.m_vSize[1] = this.m_vBase[1] * this.m_fTime;
        this.m_vSize[2] = this.m_vBase[2] * this.m_fTime;

        super.Move();
    }
}


// ****************************************************************
StartAnimation(vPosition, vSize)
{
    vec3.copy(this.m_vPosition, vPosition);
    vec3.copy(this.m_vBase,     vSize);

    this.m_fTime = 1.1;
}


// ****************************************************************
CancelAnimation()
{
    this.m_fTime = 0.0;
}


} // class cGhostPart
class cGhost {


// ****************************************************************
constructor(pOwner)
{
    this.m_pOwner = pOwner;
    this.m_apPart = new Array(10);
    this.m_fTime  = 0.0;
    this.m_iCur   = 0;

    for(let i = 0, ie = this.m_apPart.length; i < ie; ++i)
    {
        this.m_apPart[i] = new cGhostPart(this.m_pOwner.m_pModel, this.m_pOwner.m_pShader);
    }
}


// ****************************************************************
Render()
{
    for(let i = 0, ie = this.m_apPart.length; i < ie; ++i)
    {
        this.m_apPart[i].Render();
    }
}


// ****************************************************************
Move()
{
    if(this.m_pOwner.m_bActive)
    {
        this.m_fTime += 60.0 * WIND.g_fTime;
        if(this.m_fTime >= 1.0)
        {
            this.m_fTime -= 1.0;

            if(++this.m_iCur >= this.m_apPart.length) this.m_iCur = 0;
            this.m_apPart[this.m_iCur].StartAnimation(this.m_pOwner.m_vPosition, this.m_pOwner.m_vSize);
        }
    }

    for(let i = 0, ie = this.m_apPart.length; i < ie; ++i)
    {
        this.m_apPart[i].Move();
    }
}


} // class cGhost