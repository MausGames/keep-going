//////////////////////////////////////////////////////
//*------------------------------------------------*//
//| Part of Keep Going (https://www.maus-games.at) |//
//*------------------------------------------------*//
//| Copyright (c) 2020 Martin Mauersics            |//
//| Released under the zlib License                |//
//*------------------------------------------------*//
//////////////////////////////////////////////////////
"use strict";
class cEnemy extends windObject {


// ****************************************************************
static Init()
{
    cEnemy.s_pShader = new windShader().Create(RES.cEnemy.s_sVertexShader, RES.cEnemy.s_sFragmentShader);
}


// ****************************************************************
static Exit()
{
    cEnemy.s_pShader.Destructor();
}


// ****************************************************************
constructor()
{
    super();

    vec3.set(this.m_vSize, 1.5, 1.5, 1.5);
    this.m_pModel     = cPlayer.s_pModel;
    this.m_pShader    = cEnemy.s_pShader;

    this.m_vMove      = vec2.create();
    this.m_vVelocity  = vec3.create();

    this.m_bActive    = false;
    this.m_bVisible   = false;

    this.m_fTime      = 0.0;
    this.m_nBehaviour = null;
}


// ****************************************************************
Render()
{
    if(this.m_bVisible)
    {
        super.Render();
    }
}


// ****************************************************************
Move()
{
    if(this.m_bVisible)
    {
        if(this.m_nBehaviour)
        {
            this.m_fTime += 1.0 * WIND.g_fTime;
            this.m_nBehaviour();
        }

        super.Move();
    }
}


// ****************************************************************
DefaultBehaviour()
{
    vec2.sub(this.m_vMove, g_pPlayer.m_vPosition, this.m_vPosition);

    vec2.zero(WIND.V);
    if(vec2.sqrLen(this.m_vMove) !== 0.0)
    {
        vec2.normalize(WIND.V, this.m_vMove);
    }

    const fBreak = Math.pow(1.0 - 1.0 * (1.0/60.0), WIND.g_fTime * 60.0);

    this.m_vVelocity[0] = (this.m_vVelocity[0] + WIND.V[0] * (40.0 * WIND.g_fTime)) * fBreak;
    this.m_vVelocity[1] = (this.m_vVelocity[1] + WIND.V[1] * (40.0 * WIND.g_fTime)) * fBreak;

    this.m_vPosition[0] = this.m_vPosition[0] + this.m_vVelocity[0] * WIND.g_fTime;
    this.m_vPosition[1] = this.m_vPosition[1] + this.m_vVelocity[1] * WIND.g_fTime;
}


} // class cEnemy