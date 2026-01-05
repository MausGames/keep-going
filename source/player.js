//////////////////////////////////////////////////////
//*------------------------------------------------*//
//| Part of Keep Going (https://www.maus-games.at) |//
//*------------------------------------------------*//
//| Copyright (c) 2020 Martin Mauersics            |//
//| Released under the zlib License                |//
//*------------------------------------------------*//
//////////////////////////////////////////////////////
"use strict";
class CPlayer extends windObject {


// ****************************************************************
static Init()
{
    CPlayer.s_pModel  = new windModel ().Create(RES.CPlayer.s_afVertexData,  RES.CPlayer.s_aiIndexData);
    CPlayer.s_pShader = new windShader().Create(RES.CPlayer.s_sVertexShader, RES.CPlayer.s_sFragmentShader);
}


// ****************************************************************
static Exit()
{
    CPlayer.s_pModel .Destructor();
    CPlayer.s_pShader.Destructor();
}


// ****************************************************************
constructor()
{
    super();

    this.m_pModel     = CPlayer.s_pModel;
    this.m_pShader    = CPlayer.s_pShader;

    this.m_vMove      = vec2.create();
    this.m_vVelocity  = vec3.create();

    this.m_bActive    = true;
    this.m_fIntro     = 0.0;
    this.m_fExplosion = 0.0;

    this.m_pGhost     = new CGhost(this);
}


// ****************************************************************
Render()
{
    super.Render();

    this.m_pGhost.Render();
}


// ****************************************************************
Move()
{
    if(this.m_bActive)
    {
        vec2.zero(this.m_vMove);
        if(g_abInput[0]) this.m_vMove[0] -= 1.0;
        if(g_abInput[1]) this.m_vMove[0] += 1.0;
        if(g_abInput[2]) this.m_vMove[1] -= 1.0;
        if(g_abInput[3]) this.m_vMove[1] += 1.0;

        vec2.zero(WIND.V);
        if(vec2.sqrLen(this.m_vMove) !== 0.0)
        {
            vec2.normalize(WIND.V, this.m_vMove);
        }

        const fBreak = UTILS.Friction(PLAYER_BREAK * 1.14, WIND.g_fTime);

        this.m_vVelocity[0] = (this.m_vVelocity[0] + WIND.V[0] * (PLAYER_SPEED * WIND.g_fTime)) * fBreak;
        this.m_vVelocity[1] = (this.m_vVelocity[1] + WIND.V[1] * (PLAYER_SPEED * WIND.g_fTime)) * fBreak;

        this.m_vPosition[0] = this.m_vPosition[0] + this.m_vVelocity[0] * WIND.g_fTime;
        this.m_vPosition[1] = this.m_vPosition[1] + this.m_vVelocity[1] * WIND.g_fTime;

        this.m_fIntro = Math.min(this.m_fIntro + 3.0 * WIND.g_fTime, 1.0);
    }
    else
    {
        this.m_fExplosion = Math.min(this.m_fExplosion + 3.0 * WIND.g_fTime, 1.0);
    }

    const fSize = 1.4 * this.m_fIntro + 5.0 * this.m_fExplosion;
    vec3.set(this.m_vSize, fSize, fSize, fSize);

    this.m_vColor[3] = UTILS.LerpHermite3(1.0, 0.0, this.m_fExplosion);

    super.Move();

    this.m_pGhost.Move();
}


} // class CPlayer