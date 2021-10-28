//////////////////////////////////////////////////////////////////////////////////
//*----------------------------------------------------------------------------*//
//| Keep Going v1.0.0 (https://www.maus-games.at)                              |//
//*----------------------------------------------------------------------------*//
//| Copyright (c) 2020 Martin Mauersics                                        |//
//|                                                                            |//
//| This software is provided 'as-is', without any express or implied          |//
//| warranty. In no event will the authors be held liable for any damages      |//
//| arising from the use of this software.                                     |//
//|                                                                            |//
//| Permission is granted to anyone to use this software for any purpose,      |//
//| including commercial applications, and to alter it and redistribute it     |//
//| freely, subject to the following restrictions:                             |//
//|                                                                            |//
//| 1. The origin of this software must not be misrepresented; you must not    |//
//|    claim that you wrote the original software. If you use this software    |//
//|    in a product, an acknowledgment in the product documentation would be   |//
//|    appreciated but is not required.                                        |//
//|                                                                            |//
//| 2. Altered source versions must be plainly marked as such, and must not be |//
//|    misrepresented as being the original software.                          |//
//|                                                                            |//
//| 3. This notice may not be removed or altered from any source distribution. |//
//*----------------------------------------------------------------------------*//
//////////////////////////////////////////////////////////////////////////////////
"use strict";
const APP = {};


// ****************************************************************
APP.SETTINGS = {};
APP.SETTINGS.Alpha   = false;
APP.SETTINGS.Depth   = true;
APP.SETTINGS.Stencil = false;


// ****************************************************************
const NUM_ENEMIES     = 40;
const NUM_FLOORS      = 3;
const NUM_LEVELS      = 10;
const HOLE_SIZE_MAX   = 7.0;
const HOLE_SIZE_MIN   = 2.5;
const HOLE_DIST       = 20.0;
const HOLE_TIME_START = 0.1;
const HOLE_TIME_GAIN  = 0.006;
const HOLE_TIME_MAX   = 50;
const PLAYER_SPEED    = 1000.0;
const PLAYER_BREAK    = 14.0;
const ENEMY_RANGE     = 2.0;


// ****************************************************************
let g_pPlayer = null;
let g_apEnemy = new Array(NUM_ENEMIES);
let g_apFloor = new Array(NUM_FLOORS);

let g_iCurEnemy  = 0;

let g_iCurFloor0 = 0;
let g_iCurFloor1 = 1;
let g_iCurFloor2 = 2;

let g_fCurColor     = UTILS.Rand();
let g_fCurHoleAngle = 0.5*Math.PI;

let g_abInput = new Array(4);

let g_fHeightOffset   = 0.0;
let g_fHeightVelocity = 0.0;

let g_bFallState = false;
let g_iFallCount = 0;

let g_iLevelNext = -1;
let g_fLevelTime = 0.0;

let g_pMenuThanks = null;


// ****************************************************************
APP.Init = function()
{
    cPlayer.Init();
    cEnemy .Init();
    cFloor .Init();

    g_pPlayer = new cPlayer();
    for(let i = 0; i < NUM_ENEMIES; ++i) g_apEnemy[i] = new cEnemy();
    for(let i = 0; i < NUM_FLOORS;  ++i) g_apFloor[i] = new cFloor();

    g_apFloor[0].m_vHoleData[0] =  HOLE_DIST;
    g_apFloor[1].m_vHoleData[0] = -HOLE_DIST;

    g_apFloor[0].SetText("KEEP", "GOING");

    g_pMenuThanks = document.getElementById("text-thanks");

    vec3.set(WIND.g_vCamPosition,    0.0, 0.0, 45.0);
    vec3.set(WIND.g_vCamTarget,      0.0, 0.0, 0.0);
    vec3.set(WIND.g_vCamOrientation, 0.0, 1.0, 0.0);
};


// ****************************************************************
APP.Exit = function()
{
    cPlayer.Exit();
    cEnemy .Exit();
    cFloor .Exit();
};


// ****************************************************************
APP.Render = function()
{
    g_apFloor[g_iCurFloor2].Render();
    g_apFloor[g_iCurFloor1].Render();

    if(g_pPlayer.m_bActive) g_pPlayer.Render();
    for(let i = 0; i < NUM_ENEMIES; ++i) if(g_apEnemy[i].m_bActive) g_apEnemy[i].Render();

    g_apFloor[g_iCurFloor0].Render();

    if(!g_pPlayer.m_bActive) g_pPlayer.Render();
    for(let i = 0; i < NUM_ENEMIES; ++i) if(!g_apEnemy[i].m_bActive) g_apEnemy[i].Render();
};


// ****************************************************************
APP.Move = function()
{
    if(g_iFallCount) g_fLevelTime += (HOLE_TIME_START + (Math.min(g_iFallCount, HOLE_TIME_MAX) * HOLE_TIME_GAIN)) * WIND.g_fTime;

    g_pPlayer.Move();

    if(g_pPlayer.m_bActive)
    {
        if(g_fLevelTime >= 1.0) g_pPlayer.m_bActive = false;

        for(let i = 0; i < NUM_ENEMIES; ++i)
        {
            if(!g_apEnemy[i].m_bActive) continue;

            const fDiff = vec3.squaredDistance(g_apEnemy[i].m_vPosition, g_pPlayer.m_vPosition);
            if(fDiff < UTILS.Pow2(ENEMY_RANGE))
            {
                g_pPlayer.m_bActive = false;
                break;
            }
        }

        if(!g_pPlayer.m_bActive)
        {
            g_pMenuThanks.innerHTML = "<p>THANK YOU FOR PLAYING</p>";
            UTILS.SetElementOpacity(g_pMenuThanks, 1.0);

            CreateEnd();
        }
    }

    if(!g_bFallState)
    {
        const fDiff = vec2.squaredDistance(g_apFloor[g_iCurFloor0].m_vHoleData, g_pPlayer.m_vPosition);
        if(fDiff < UTILS.Pow2(Math.max(g_apFloor[g_iCurFloor0].GetHoleSize(), HOLE_SIZE_MIN)))
        {
            g_bFallState = true;

            g_fCurColor     += 0.05;
            g_fCurHoleAngle += 1.0*Math.PI + (1.0*Math.PI * UTILS.RandFloat(-0.5, 0.5));

            UTILS.Vec3HsvToRgb (g_apFloor[g_iCurFloor2].m_vColor,    g_fCurColor % 1.0, 0.6, 1.0);
            UTILS.Vec2Direction(g_apFloor[g_iCurFloor2].m_vHoleData, g_fCurHoleAngle);

            g_apFloor[g_iCurFloor2].m_vHoleData[0] *= HOLE_DIST;
            g_apFloor[g_iCurFloor2].m_vHoleData[1] *= HOLE_DIST;

            for(let i = 0; i < NUM_ENEMIES; ++i) g_apEnemy[i].m_bActive = false;

            CreateLevel(g_iLevelNext);

            g_iLevelNext = (g_iLevelNext + UTILS.RandInt(1, NUM_LEVELS - 1)) % NUM_LEVELS;
            g_fLevelTime = 0.0;
        }
    }

    if(g_bFallState)
    {
        g_fHeightVelocity += 15.0 * WIND.g_fTime;
        g_fHeightOffset   += g_fHeightVelocity * WIND.g_fTime;

        if(g_fHeightOffset >= 1.0)
        {
            g_fHeightVelocity = 0.0;
            g_fHeightOffset   = 0.0;

            g_bFallState = false;
            g_iFallCount += 1;

            g_iCurFloor0 = (g_iCurFloor1);
            g_iCurFloor1 = (g_iCurFloor0 + 1) % NUM_FLOORS;
            g_iCurFloor2 = (g_iCurFloor0 + 2) % NUM_FLOORS;

            for(let i = 0; i < NUM_ENEMIES; ++i) if(!g_apEnemy[i].m_bActive) g_apEnemy[i].m_bVisible = false;
        }
    }

    for(let i = 0; i < NUM_ENEMIES; ++i)
    {
        if(g_apEnemy[i].m_bActive)
        {
            g_apEnemy[i].m_vPosition[2] = (g_bFallState ? (g_fHeightOffset - 1.0) : g_fHeightOffset) * 40.0;
            g_apEnemy[i].m_vColor   [3] = 1.0;
        }
        else
        {
            g_apEnemy[i].m_vPosition[2] = g_fHeightOffset * 40.0;
            g_apEnemy[i].m_vColor   [3] = Math.min(g_apEnemy[i].m_vColor[3], 1.0 - g_fHeightOffset);
        }
    }

    g_apFloor[g_iCurFloor0].m_vPosition[2] = (g_fHeightOffset)       * 40.0;
    g_apFloor[g_iCurFloor1].m_vPosition[2] = (g_fHeightOffset - 1.0) * 40.0;
    g_apFloor[g_iCurFloor2].m_vPosition[2] = (g_fHeightOffset - 2.0) * 40.0;

    g_apFloor[g_iCurFloor0].m_vColor[3] = 1.0 - g_fHeightOffset;
    g_apFloor[g_iCurFloor1].m_vColor[3] = 1.0;
    g_apFloor[g_iCurFloor2].m_vColor[3] = g_fHeightOffset;

    if(g_iFallCount) g_apFloor[g_iCurFloor0].SetText(g_iFallCount.toString());
    g_apFloor[g_iCurFloor1].SetText((g_iFallCount + 1).toString());
    g_apFloor[g_iCurFloor2].SetText((g_iFallCount - 1).toString());

    if(!g_bFallState) g_apFloor[g_iCurFloor0].SetHoleSize(1.0 - g_fLevelTime);
    g_apFloor[g_iCurFloor1].SetHoleSize(g_bFallState ? (1.0 - g_fLevelTime) : 1.0);
    g_apFloor[g_iCurFloor2].SetHoleSize(1.0);

    for(let i = 0; i < NUM_ENEMIES; ++i)
        g_apEnemy[i].Move();

    for(let i = 0; i < NUM_FLOORS; ++i)
        g_apFloor[i].Move();
};


// ****************************************************************
APP.MouseDown = function(iButton)
{

};


// ****************************************************************
APP.MouseUp = function(iButton)
{

};


// ****************************************************************
APP.KeyDown = function(iKey)
{
    if((iKey === UTILS.KEY.LEFT)  || (iKey === UTILS.KEY.A)) g_abInput[0] = true;
    if((iKey === UTILS.KEY.RIGHT) || (iKey === UTILS.KEY.D)) g_abInput[1] = true;
    if((iKey === UTILS.KEY.DOWN)  || (iKey === UTILS.KEY.S)) g_abInput[2] = true;
    if((iKey === UTILS.KEY.UP)    || (iKey === UTILS.KEY.W)) g_abInput[3] = true;
};


// ****************************************************************
APP.KeyUp = function(iKey)
{
    if((iKey === UTILS.KEY.LEFT)  || (iKey === UTILS.KEY.A)) g_abInput[0] = false;
    if((iKey === UTILS.KEY.RIGHT) || (iKey === UTILS.KEY.D)) g_abInput[1] = false;
    if((iKey === UTILS.KEY.DOWN)  || (iKey === UTILS.KEY.S)) g_abInput[2] = false;
    if((iKey === UTILS.KEY.UP)    || (iKey === UTILS.KEY.W)) g_abInput[3] = false;
};


// ****************************************************************
APP.StartGame = function()
{

};


// ****************************************************************
APP.PauseGame = function(bStatus)
{

};


// ****************************************************************
APP.ChangeOptionQuality = function(bStatus)
{

};


// ****************************************************************
APP.ChangeOptionMusic = function(bStatus)
{

};


// ****************************************************************
APP.ChangeOptionSound = function(bStatus)
{

};


// ****************************************************************
APP.Resize = function(sWidth, sMargin)
{
    g_pMenuThanks.style.width      = sWidth;
    g_pMenuThanks.style.marginLeft = sMargin;
};