//////////////////////////////////////////////////////
//*------------------------------------------------*//
//| Part of Keep Going (https://www.maus-games.at) |//
//*------------------------------------------------*//
//| Released under the zlib License                |//
//| More information available in the readme file  |//
//*------------------------------------------------*//
//////////////////////////////////////////////////////
"use strict";


// ****************************************************************
function CreateEnemy()
{
    if(++g_iCurEnemy >= NUM_ENEMIES) g_iCurEnemy = 0;
    const pEnemy = g_apEnemy[g_iCurEnemy];

    pEnemy.m_vColor[3]  = 1.0;
    pEnemy.m_bActive    = true;
    pEnemy.m_bVisible   = true;
    pEnemy.m_fTime      = 0.0;
    pEnemy.m_nBehaviour = null;

    return pEnemy;
}


// ****************************************************************
function CreateLevel(iType)
{
    switch(iType)
    {
    default: break;
    case 0: Level00(); break;
    case 1: Level01(); break;
    case 2: Level02(); break;
    }
}


// ****************************************************************
function CreateEnd()
{
    for(let i = 0; i < 10; ++i)
    {
        const pEnemy = CreateEnemy();

        pEnemy.m_vPosition[0] = g_pPlayer.m_vPosition[0];
        pEnemy.m_vPosition[1] = g_pPlayer.m_vPosition[1];

        UTILS.Vec2Direction(pEnemy.m_vVelocity, i * 0.2*Math.PI);
        pEnemy.m_vVelocity[0] = pEnemy.m_vVelocity[0] * 50.0 * (Math.random() + 0.1) + g_pPlayer.m_vVelocity[0] * 1.0;
        pEnemy.m_vVelocity[1] = pEnemy.m_vVelocity[1] * 50.0 * (Math.random() + 0.1) + g_pPlayer.m_vVelocity[1] * 1.0;

        pEnemy.m_nBehaviour = pEnemy.DefaultBehaviour;
    }
}


// ****************************************************************
function Level00()
{
    for(let i = 0; i < 10; ++i)
    {
        const x = (Math.random() * 2.0 - 1.0) * 30.0;
        const y = (Math.random() * 2.0 - 1.0) * 30.0;

        WIND.V[0] = x - g_pPlayer.m_vPosition[0];
        WIND.V[1] = y - g_pPlayer.m_vPosition[1];

        const fLen = vec2.squaredLength(WIND.V);
        if(fLen < 900.0)
        {
            i -= 1;
            continue;
        }

        const pEnemy = CreateEnemy();

        pEnemy.m_vPosition[0] = x;
        pEnemy.m_vPosition[1] = y;

        UTILS.Vec2Direction(pEnemy.m_vVelocity, 2.0*Math.PI * Math.random());
        pEnemy.m_vVelocity[0] = pEnemy.m_vVelocity[0] * 20.0;
        pEnemy.m_vVelocity[1] = pEnemy.m_vVelocity[1] * 20.0;

        pEnemy.m_nBehaviour = pEnemy.DefaultBehaviour;
    }
}


// ****************************************************************
let g_iLevel01Type = 0;
function Level01()
{
    g_iLevel01Type += 1;

    const iType = g_iLevel01Type % 2;
    const fBase = UTILS.Vec2Angle(g_pPlayer.m_vPosition) + 0.5*Math.PI;

    for(let i = 0; i < 10; ++i)
    {
        const pEnemy = CreateEnemy();

        pEnemy.m_nBehaviour = function()
        {
            UTILS.Vec2Direction(WIND.V, fBase + 0.5*Math.PI * (this.m_fTime - 0.3) * (iType ? 1.0 : -1.0));
            const fOffset = (i - 4.5) * 5.0;

            vec2.set(this.m_vPosition, WIND.V[0] * fOffset, WIND.V[1] * fOffset);
        };
    }
}


// ****************************************************************
function Level02()
{
    const iAxis = (Math.abs(g_pPlayer.m_vPosition[0]) < Math.abs(g_pPlayer.m_vPosition[1])) ? 1 : 0;
    const fSide = -Math.sign(g_pPlayer.m_vPosition[iAxis]);

    for(let i = 0, ie = 8; i < ie; ++i)
    {
        const pEnemy = CreateEnemy();

        pEnemy.m_nBehaviour = function()
        {
            const fValue  = Math.cos(0.4*Math.PI * this.m_fTime) * 30.0;
            const fOffset = (i - 3.5) * 5.0;

            this.m_vPosition[iAxis]   = fValue * fSide;
            this.m_vPosition[1-iAxis] = fOffset;
        };
    }
}