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
    case 3: Level03(); break;
    case 4: Level04(); break;
    case 5: Level05(); break;
    case 6: Level06(); break;
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
function LastHolePos()
{
    return g_apFloor[g_iCurFloor0].m_vHoleData;
}

function NextHolePos()
{
    return g_apFloor[g_iCurFloor1].m_vHoleData;
}


// ****************************************************************
function Level00()
{
    for(let i = 0; i < 10; ++i)
    {
        const x = (Math.random() * 2.0 - 1.0) * 30.0;
        const y = (Math.random() * 2.0 - 1.0) * 30.0;

        WIND.V[0] = x - LastHolePos()[0];
        WIND.V[1] = y - LastHolePos()[1];

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
    const fBase = UTILS.Vec2Angle(LastHolePos()) + 0.5*Math.PI;

    for(let i = 0; i < 10; ++i)
    {
        const pEnemy = CreateEnemy();

        pEnemy.m_nBehaviour = function()
        {
            UTILS.Vec2Direction(WIND.V, fBase + 0.5*Math.PI * (Math.max(this.m_fTime - 0.06 * Math.abs(4.5 - i), 0.0) - 0.1) * (iType ? 1.0 : -1.0));
            const fOffset = (i - 4.5) * 5.0;

            vec2.set(this.m_vPosition, WIND.V[0] * fOffset, WIND.V[1] * fOffset);
        };
    }
}


// ****************************************************************
function Level02()
{
    const iAxis = (Math.abs(LastHolePos()[0]) < Math.abs(LastHolePos()[1])) ? 1 : 0;
    const fSide = -Math.sign(LastHolePos()[iAxis]);

    for(let i = 0, ie = 9; i < ie; ++i)
    {
        const pEnemy = CreateEnemy();

        pEnemy.m_nBehaviour = function()
        {
            const fValue  = Math.cos(0.4*Math.PI * (this.m_fTime - 0.1 * Math.abs(4.0 - i))) * 30.0;
            const fOffset = (i - 4.0) * 5.0;

            this.m_vPosition[iAxis]   = fValue * fSide;
            this.m_vPosition[1-iAxis] = fOffset;
        };
    }
}


// ****************************************************************
function Level03()
{
    const fBase = UTILS.Vec2Angle(LastHolePos()) + 0.5*Math.PI;

    for(let i = 0; i < 12; ++i)
    {
        const pEnemy = CreateEnemy();

        pEnemy.m_nBehaviour = function()
        {
            UTILS.Vec2Direction(WIND.V, fBase + 2.0*Math.PI * (i / 6.0));
            const fValue = Math.cos(0.4*Math.PI * (this.m_fTime - 0.1)) * ((i < 6.0) ? 35.0 : 30.0);

            vec2.set(this.m_vPosition, WIND.V[0] * fValue, WIND.V[1] * fValue);
        };
    }
}


// ****************************************************************
let g_iLevel04Type = 0;
function Level04()
{
    g_iLevel04Type += 1;

    const iType   = g_iLevel04Type % 2;
    const fBase   = UTILS.Vec2Angle(LastHolePos());
    const vCenter = vec2.clone(NextHolePos());

    for(let i = 0; i < 12; ++i)
    {
        const pEnemy = CreateEnemy();

        pEnemy.m_nBehaviour = function()
        {
            UTILS.Vec2Direction(WIND.V, fBase + 0.6*Math.PI * this.m_fTime * (iType ? 1.0 : -1.0) * ((i < 6) ? 1.0 : -0.5) + 2.0*Math.PI * ((i / 6.0) + (1.0/24.0) * ((i % 2) ? -1.0 : 1.0) * ((i < 6) ? 1.0 : 1.5)));
            const fOffset = ((i < 6) ? 10.0 : 20.0);

            vec2.set(this.m_vPosition, WIND.V[0] * fOffset + vCenter[0], WIND.V[1] * fOffset + vCenter[1]);
        };
    }
}


// ****************************************************************
function Level05()
{
    const fSide1 = -Math.sign(LastHolePos()[0]);
    const fSide2 = -Math.sign(LastHolePos()[1]);

    for(let i = 0, ie = 10; i < ie; ++i)
    {
        const pEnemy = CreateEnemy();

        pEnemy.m_nBehaviour = function()
        {
            const fValue  = Math.cos(0.4*Math.PI * (this.m_fTime - 0.1 * (((i % 5) + 1) % 2))) * 30.0 * 0.7071;
            const fOffset = (i - 4.5 + ((i < 5) ? -0.75 : 0.75)) * 5.0 * 0.7071;

            this.m_vPosition[0] = (fValue - fOffset) * fSide1;
            this.m_vPosition[1] = (fValue + fOffset) * fSide2;
        };
    }
}


// ****************************************************************
function Level06()
{
    const iAxis  = (Math.abs(LastHolePos()[0]) < Math.abs(LastHolePos()[1])) ? 1 : 0;
    const fSide1 = -Math.sign(LastHolePos()[iAxis]);
    const fSide2 = -Math.sign(LastHolePos()[1-iAxis]);

    for(let i = 0, ie = 12; i < ie; ++i)
    {
        const pEnemy = CreateEnemy();

        pEnemy.m_nBehaviour = function()
        {
            const fValue  = Math.cos(0.4*Math.PI * this.m_fTime + 1.0*Math.PI * (Math.floor(i/2) % 2) + 0.1 * (i - 5.5)) * 30.0;
            const fOffset = (i - 5.5) * 5.0;

            this.m_vPosition[iAxis]   = fOffset * fSide1;
            this.m_vPosition[1-iAxis] = fValue  * fSide2;
        };
    }
}