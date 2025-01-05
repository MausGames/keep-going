//////////////////////////////////////////////////////
//*------------------------------------------------*//
//| Part of Keep Going (https://www.maus-games.at) |//
//*------------------------------------------------*//
//| Copyright (c) 2020 Martin Mauersics            |//
//| Released under the zlib License                |//
//*------------------------------------------------*//
//////////////////////////////////////////////////////
"use strict";
class cFloor extends windObject {


// ****************************************************************
static Init()
{
    cFloor.s_pModel  = new windModel ().Create(RES.cFloor.s_afVertexData,  RES.cFloor.s_aiIndexData);
    cFloor.s_pShader = new windShader().Create(RES.cFloor.s_sVertexShader, RES.cFloor.s_sFragmentShader);
}


// ****************************************************************
static Exit()
{
    cFloor.s_pModel .Destructor();
    cFloor.s_pShader.Destructor();
}


// ****************************************************************
constructor()
{
    super();

    vec3.set(this.m_vSize, 100.0, 100.0, 1.0);
    this.m_pModel       = cFloor.s_pModel;
    this.m_pShader      = cFloor.s_pShader;
    this.m_apTexture[0] = new windTexture().Create(256, 256, false);

    this.m_sText        = "";
    this.m_vHoleData    = vec3.fromValues(0.001, 0.001, HOLE_SIZE_MAX);
}


// ****************************************************************
Render()
{
    this.m_pShader.Enable();
    this.m_pShader.SendUniformVec3("u_v3HoleData", this.m_vHoleData);

    super.Render();
}


// ****************************************************************
Move()
{
    super.Move();
}


// ****************************************************************
SetText(sText, sText2)
{
    if(this.m_sText === sText) return;
    this.m_sText = sText;

    TEX.width  = this.m_apTexture[0].m_iWidth;
    TEX.height = this.m_apTexture[0].m_iHeight;

    vec2.set(WIND.V, TEX.width / 2, TEX.height / 4);

    TEX.DRAW.font         = (sText2 ? "55" : "70") + "px supply";
    TEX.DRAW.textAlign    = "center";
    TEX.DRAW.textBaseline = "middle";

    TEX.DRAW.fillStyle = "#FFFFFF";
    TEX.DRAW.fillRect(0, 0, TEX.width, TEX.height);

    TEX.DRAW.fillStyle = "#BBBBBB";
    TEX.DRAW.fillText(sText, WIND.V[0], WIND.V[1] * (sText2 ? 1.5 : 2.0));
    if(sText2) TEX.DRAW.fillText(sText2, WIND.V[0], WIND.V[1] * 2.5);

    this.m_apTexture[0].Modify(TEX);
}


// ****************************************************************
SetHoleSize(fValue)
{
    this.m_vHoleData[2] = HOLE_SIZE_MAX * UTILS.Clamp(fValue, -0.05, 1.0);
}


// ****************************************************************
GetHoleSize()
{
    return this.m_vHoleData[2];
}


} // class cFloor